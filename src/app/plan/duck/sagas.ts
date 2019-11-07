import { takeEvery, takeLatest, select, retry, race, call, delay, put, take } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { updateMigPlanFromValues } from '../../../client/resources/conversions';
import {
  AlertActions,
} from '../../common/duck/actions';
import { PlanActions, PlanActionTypes } from './actions';
import { CurrentPlanState } from './reducers';
import {
  MigResource,
  ExtendedCoreNamespacedResource,
  CoreNamespacedResourceKind,
  ExtendedCoreNamespacedResourceKind,
  CoreClusterResource,
  CoreClusterResourceKind,
  CoreNamespacedResource,
  MigResourceKind
} from '../../../client/resources';
import Q from 'q';

const PlanUpdateTotalTries = 6;
const PlanUpdateRetryPeriodSeconds = 5;

function* checkPVs(action) {
  const params = { ...action.params };
  let pvsFound = false;
  let tries = 0;
  const TicksUntilTimeout = 20;

  while (!pvsFound) {
    if (tries < TicksUntilTimeout) {
      tries += 1;
      const plansRes = yield call(params.asyncFetch);
      const pollingStatus = params.callback(plansRes);
      switch (pollingStatus) {
        case 'SUCCESS':
          pvsFound = true;
          yield put(PlanActions.stopPVPolling());
          break;
        case 'FAILURE':
          pvsFound = true;
          yield put(PlanActions.pvFetchFailure());
          yield put(PlanActions.stopPVPolling());
          break;
        default:
          break;
      }
      yield delay(params.delay);
    } else {
      // PV discovery timed out, alert and stop polling
      pvsFound = true; // No PVs timed out
      yield put(AlertActions.alertErrorTimeout('Timed out during PV discovery'));
      yield put(PlanActions.pvFetchSuccess());
      yield put(PlanActions.stopPVPolling());
      break;
    }
  }
}

function* getPlanSaga(planName) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try {
    return yield client.get(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      planName
    );
  } catch (err) {
    throw err;
  }
}

function* putPlanSaga(planValues) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try {
    const getPlanRes = yield call(getPlanSaga, planValues.planName);
    const updatedMigPlan = updateMigPlanFromValues(getPlanRes.data, planValues);
    if (!updatedMigPlan) {
      return;
    }

    yield client.put(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      planValues.planName,
      updatedMigPlan
    );

    const updatedPlan = yield waitForReconcileCycle(planValues.planName);
    yield put(PlanActions.planUpdateSuccess());
    yield put(PlanActions.updatePlanList(updatedPlan));
  } catch (err) {
    yield put(PlanActions.planUpdateFailure(err));
    throw err;
  }
}

function* planUpdateRetry(action) {
  try {
    yield retry(
      PlanUpdateTotalTries,
      PlanUpdateRetryPeriodSeconds * 1000,
      putPlanSaga,
      action.planValues,
    );
  } catch (error) {
    yield put(AlertActions.alertErrorTimeout('Failed to update plan'));
  }
}

function* checkClosedStatus(action) {
  const reconcileTimeouts = 3;
  for (let tries = 0; tries < reconcileTimeouts; tries++) {
    const closedPlan = yield waitForReconcileCycle(action.planName);

    if (closedPlan.status && closedPlan.status.conditions) {
      const hasClosedCondition = !!closedPlan.status.conditions.some(c => c.type === 'Closed');
      if (hasClosedCondition) {
        yield put(PlanActions.planCloseSuccess());
        yield put(PlanActions.stopClosedStatusPolling(action.planName));
        return;
      }
    }
  }
  yield put(PlanActions.planCloseFailure('Failed to close plan'));
  yield put(AlertActions.alertErrorTimeout('Timed out during plan close'));
  yield put(PlanActions.stopClosedStatusPolling(action.planName));
}

const isPlanUpdated = (currMigPlan, prevMigPlan) => {
  const corePlan = (plan) => {
    const { metadata } = plan;
    if (metadata.annotations || metadata.generation || metadata.resourceVersion) {
      delete metadata.annotations;
      delete metadata.generation;
      delete metadata.resourceVersion;
    }
    if (plan.status) {
      for (let i = 0; plan.status.conditions.length > i; i++) {
        delete plan.status.conditions[i].lastTransitionTime;
      }
    }
    return plan;
  };
  const currMigPlanCore = corePlan(currMigPlan);
  const prevMigPlanCore = corePlan(prevMigPlan);

  if (JSON.stringify(currMigPlanCore) !== JSON.stringify(prevMigPlanCore)) {
    return true;
  } else {
    return false;
  }
};

function* waitForReconcileCycle(planName) {
  let getPlanResponse = yield call(getPlanSaga, planName);

  yield put(PlanActions.planReconcilePolling(getPlanResponse.data));
  yield take(PlanActionTypes.PLAN_RECONCILE_POLL_STOP);

  getPlanResponse = yield call(getPlanSaga, planName);

  return getPlanResponse.data;
}

function* updateCurrentPlan(plan) {
  //diff current plan before setting
  const state = yield select();
  const { currentPlan } = state.plan;
  if (!currentPlan || isPlanUpdated(plan, currentPlan)) {
    yield put(PlanActions.setCurrentPlan(plan));
  }
}

function* checkPlanStatus(action) {
  const reconcileTimeouts = 3;
  for (let tries = 0; tries < reconcileTimeouts; tries++) {
    yield put(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.Pending }));
    const updatedPlan = yield waitForReconcileCycle(action.planName);
    yield updateCurrentPlan(updatedPlan);

    if (!updatedPlan.status || !updatedPlan.status.conditions) {
      continue;
    }
    const hasReadyCondition = !!updatedPlan.status.conditions.some(c => c.type === 'Ready');
    const hasWarnCondition = !!updatedPlan.status.conditions.some(cond => {
      return cond.category === 'Warn';
    });
    const hasCriticalCondition = !!updatedPlan.status.conditions.some(cond => {
      return cond.category === 'Critical';
    });
    const hasConflictCondition = !!updatedPlan.status.conditions.some(cond => {
      return cond.type === 'PlanConflict';
    });
    if (hasReadyCondition) {
      if (hasWarnCondition) {
        const warnCondition = updatedPlan.status.conditions.find(cond => {
          return cond.category === 'Warn';
        });
        yield put(PlanActions.updateCurrentPlanStatus(
          { state: CurrentPlanState.Warn, warnMessage: warnCondition.message }));
      } else {
        yield put(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.Ready, }));
      }
      yield put(PlanActions.stopPlanStatusPolling());
    }
    if (hasCriticalCondition) {
      const criticalCond = updatedPlan.status.conditions.find(cond => {
        return cond.category === 'Critical';
      });
      yield put(PlanActions.updateCurrentPlanStatus(
        { state: CurrentPlanState.Critical, errorMessage: criticalCond.message }
      ));

      yield put(PlanActions.stopPlanStatusPolling());
    }

    if (hasConflictCondition) {
      const conflictCond = updatedPlan.status.conditions.find(cond => {
        return cond.type === 'PlanConflict';
      });
      yield put(PlanActions.updateCurrentPlanStatus(
        { state: CurrentPlanState.Critical, errorMessage: conflictCond.message }
      ));

      yield put(PlanActions.stopPlanStatusPolling());
    }
    return;
  }

  // TimedOut
  yield put(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.TimedOut }));
  yield put(PlanActions.stopPlanStatusPolling());
}

function* planReconcileWatch(plan) {
  const pollingInterval = 2000;
  const retries = 10;
  const planResourceVersion = plan.planValues.metadata.resourceVersion;
  try {
    for (let requestNumber = 0; requestNumber < retries; requestNumber++) {
      const updatedPlan = yield call(getPlanSaga, plan.planValues.metadata.name);
      if (updatedPlan.data.metadata.resourceVersion !== planResourceVersion) {
        break;
      }
      yield delay(pollingInterval);
    }
  } catch (err) {
    yield put(AlertActions.alertError('Error during plan reconcile' + err));
  }
  yield put(PlanActions.stopPlanReconcilePolling());
}

function* planCloseSaga(action) {
  try {
    const updatedValues = {
      planName: action.planName,
      planClosed: true,
    };
    yield retry(
      PlanUpdateTotalTries,
      PlanUpdateRetryPeriodSeconds * 1000,
      putPlanSaga,
      updatedValues,
    );
    yield put(PlanActions.startClosedStatusPolling(updatedValues.planName));
  }
  catch (err) {
    yield put(PlanActions.planCloseFailure(err));
    yield put(AlertActions.alertErrorTimeout('Plan close request failed'));

  }
}

function* planCloseAndDeleteSaga(action) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try {
    yield put(PlanActions.setLockedPlan(action.planName));
    yield put(PlanActions.planCloseRequest(action.planName));
    yield take(PlanActionTypes.PLAN_CLOSE_SUCCESS);
    yield client.delete(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      action.planName,
    );
    yield put(PlanActions.planCloseAndDeleteSuccess(action.planName));
    yield put(AlertActions.alertSuccessTimeout(`Successfully removed plan "${action.planName}"!`));
  } catch (err) {
    yield put(PlanActions.planCloseAndDeleteFailure(err));
    yield put(AlertActions.alertErrorTimeout('Plan delete request failed'));
  }
}

function* getPVResourcesRequest(action) {
  const state = yield select();
  const client: IClusterClient = ClientFactory.forCluster(action.clusterName, state);
  try {
    const resource = new CoreClusterResource(CoreClusterResourceKind.PV);
    const pvResourceRefs = action.pvList.map(pv => {
      return client.get(
        resource,
        pv.name
      );
    });

    const pvList = [];
    yield Q.allSettled(pvResourceRefs)
      .then((results) => {
        results.forEach((result) => {
          if (result.state === 'fulfilled') {
            pvList.push(result.value.data);
          }
        });
      });
    yield put(PlanActions.getPVResourcesSuccess(pvList));
  } catch (err) {
    yield put(PlanActions.getPVResourcesFailure('Failed to get pv details'));

  }
}

function* watchPlanCloseAndDelete() {
  yield takeLatest(PlanActionTypes.PLAN_CLOSE_AND_DELETE_REQUEST, planCloseAndDeleteSaga);
}


function* watchClosedStatus() {
  while (true) {
    const data = yield take(PlanActionTypes.CLOSED_STATUS_POLL_START);
    yield race([call(checkClosedStatus, data), take(PlanActionTypes.CLOSED_STATUS_POLL_STOP)]);
  }
}

function* watchPlanStatus() {
  while (true) {
    const data = yield take(PlanActionTypes.PLAN_STATUS_POLL_START);
    yield race([call(checkPlanStatus, data), take(PlanActionTypes.PLAN_STATUS_POLL_STOP)]);
  }
}

function* watchPVPolling() {
  while (true) {
    const data = yield take(PlanActionTypes.START_PV_POLLING);
    yield race([call(checkPVs, data), take(PlanActionTypes.STOP_PV_POLLING)]);
  }
}

function* watchPlanReconcilePolling() {
  yield takeLatest(PlanActionTypes.PLAN_RECONCILE_POLL, planReconcileWatch);
}

function* watchPlanUpdate() {
  yield takeEvery(PlanActionTypes.PLAN_UPDATE_REQUEST, planUpdateRetry);
}


function* watchGetPVResourcesRequest() {
  yield takeLatest(PlanActionTypes.GET_PV_RESOURCES_REQUEST, getPVResourcesRequest);
}

function* watchPlanClose() {
  yield takeLatest(PlanActionTypes.PLAN_CLOSE_REQUEST, planCloseSaga);
}

export default {
  watchPlanUpdate,
  watchPVPolling,
  watchPlanReconcilePolling,
  watchPlanCloseAndDelete,
  watchPlanClose,
  watchClosedStatus,
  watchPlanStatus,
  watchGetPVResourcesRequest
};
