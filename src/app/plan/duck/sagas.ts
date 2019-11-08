import { takeEvery, takeLatest, select, retry, race, call, delay, put, take } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { createMigPlan, updateMigPlanFromValues, IMigPlan } from '../../../client/resources/conversions';
import {
  AlertActions,
} from '../../common/duck/actions';
import { PlanActions, PlanActionTypes } from './actions';
import { CurrentPlanState } from './reducers';
import planOperations from './operations';
import planUtils from './utils';
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

const PlanOperationTotalTries = 6;
const PlanOperationRetryPeriod = 5;
const ReconcileTimeouts = 3;

function* checkPVs(action) {
  let plan = yield call(getPlan, action.planName);
  let timedOut;
  for (let tries = 0; tries < ReconcileTimeouts; tries++ , timedOut = true, plan = yield waitForReconcileCycle(plan)) {
    timedOut = false;
    const pvSearchStatus = planUtils.getPlanPVsAndCheckConditions(plan);
    if (pvSearchStatus.success) {
      yield put(PlanActions.updatePlanList(plan));
      yield put(PlanActions.setCurrentPlan(plan));
      yield put(PlanActions.pvFetchSuccess());
      return 'SUCCESS';
    } else if (pvSearchStatus.error) {
      yield put(PlanActions.pvFetchFailure());
      yield put(AlertActions.alertErrorTimeout(pvSearchStatus.errorText));
      return 'FAILURE';
    }
  }

  // PV discovery timed out, alert and stop polling
  if (timedOut) {
    yield put(AlertActions.alertErrorTimeout('Timed out during PV discovery'));
  }
  yield put(PlanActions.pvFetchSuccess());
  yield put(PlanActions.stopPVPolling());
}

function* getPlan(planName) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try {
    const planReponse = yield client.get(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      planName
    );
    return planReponse.data;
  } catch (err) {
    throw err;
  }
}

function* createPlan(planValues) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try {
    const migPlanObj = createMigPlan(
      planValues.planName,
      migMeta.namespace,
      planValues.sourceCluster,
      planValues.targetCluster,
      planValues.selectedStorage,
      planValues.selectedNamespaces.map(ns => ns.metadata.name),
    );

    let createdPlan = yield client.create(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      migPlanObj
    );
    createdPlan = yield waitForReconcileCycle(createdPlan.data);

    yield put(PlanActions.startPVPolling(planValues.planName));
    yield put(PlanActions.setCurrentPlan(createdPlan));
    yield put(PlanActions.updatePlanList(createdPlan));
    yield put(PlanActions.planCreateSuccess(createdPlan));
  } catch (err) {
    yield put(PlanActions.planCreateFailure(err));
    throw err;
  }
}

function* planCreateRetry(action) {
  try {
    yield retry(
      PlanOperationTotalTries,
      PlanOperationRetryPeriod * 1000,
      createPlan,
      action.planValues,
    );
  } catch (error) {
    yield put(AlertActions.alertErrorTimeout('Failed to create plan'));
  }
}

function* putPlan(planValues) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try {
    const existingPlan = yield call(getPlan, planValues.planName);
    const updatedMigPlan = updateMigPlanFromValues(existingPlan, planValues);
    if (!updatedMigPlan) {
      return;
    }

    let updatedPlan = yield client.put(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      planValues.planName,
      updatedMigPlan
    );


    updatedPlan = yield waitForReconcileCycle(updatedPlan.data);
    if (!updatedMigPlan.spec.closed) {
      yield put(PlanActions.setCurrentPlan(updatedPlan));
    }

    yield put(PlanActions.updatePlanList(updatedPlan));
    yield put(PlanActions.planUpdateSuccess());
  } catch (err) {
    yield put(PlanActions.planUpdateFailure(err));
    throw err;
  }
}

function* planUpdateRetry(action) {
  try {
    yield retry(
      PlanOperationTotalTries,
      PlanOperationRetryPeriod * 1000,
      putPlan,
      action.planValues,
    );
  } catch (error) {
    yield put(AlertActions.alertErrorTimeout('Failed to update plan'));
  }
}

function* checkClosedStatus(action) {
  let timedOut;
  for (let tries = 0; tries < ReconcileTimeouts; tries++ , timedOut = true) {
    timedOut = false;
    const closedPlan = yield call(getPlan, action.planName);

    const hasClosedCondition = !closedPlan.status
      || !closedPlan.status.conditions
      || !!closedPlan.status.conditions.some(c => c.type === 'Closed');

    if (hasClosedCondition) {
      yield put(PlanActions.planCloseSuccess());
      break;
    }

    yield waitForReconcileCycle(closedPlan);
  }

  if (timedOut) {
    yield put(PlanActions.planCloseFailure('Failed to close plan'));
    yield put(AlertActions.alertErrorTimeout('Timed out during plan close'));
  }

  yield put(PlanActions.stopClosedStatusPolling(action.planName));
}

function* waitForReconcileCycle(plan: IMigPlan) {
  yield put(PlanActions.planReconcilePolling(plan));
  yield take(PlanActionTypes.PLAN_RECONCILE_POLL_STOP);

  return yield call(getPlan, plan.metadata.name);
}

function* checkPlanStatus(action) {
  let timedOut;
  yield put(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.Pending }));

  let plan = yield call(getPlan, action.planName);
  for (let tries = 0; tries < ReconcileTimeouts; tries++ , timedOut = true, plan = yield waitForReconcileCycle(plan)) {
    timedOut = false;
    if (!plan.status || !plan.status.conditions) {
      continue;
    }

    const readyCondition = plan.status.conditions.find(cond => cond.type === 'Ready');
    const warningCondition = plan.status.conditions.find(cond => cond.category === 'Warn');
    const criticalCondition = plan.status.conditions.find(cond => cond.category === 'Critical');
    const conflictCondition = plan.status.conditions.find(cond => cond.type === 'PlanConflict');
    if (criticalCondition) {
      yield put(PlanActions.updateCurrentPlanStatus(
        { state: CurrentPlanState.Critical, errorMessage: criticalCondition.message }
      ));
    } else if (conflictCondition) {
      yield put(PlanActions.updateCurrentPlanStatus(
        { state: CurrentPlanState.Critical, errorMessage: conflictCondition.message }
      ));
    } else if (warningCondition && readyCondition) {
      yield put(PlanActions.updateCurrentPlanStatus(
        { state: CurrentPlanState.Warn, warnMessage: warningCondition.message }));
    } else if (readyCondition) {
      yield put(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.Ready, }));
    } else {
      continue;
    }
    break;
  }

  if (timedOut) {
    yield put(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.TimedOut }));
  }
  yield put(PlanActions.stopPlanStatusPolling());
}

function* planReconcileWatch(plan) {
  const pollingInterval = 2000;
  const retries = 10;
  const planResourceVersion = plan.planValues.metadata.resourceVersion;
  try {
    for (let requestNumber = 0; requestNumber < retries; requestNumber++) {
      const updatedPlan = yield call(getPlan, plan.planValues.metadata.name);
      if (updatedPlan.metadata.resourceVersion !== planResourceVersion) {
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
      PlanOperationTotalTries,
      PlanOperationRetryPeriod * 1000,
      putPlan,
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

function* watchPlanCreate() {
  yield takeEvery(PlanActionTypes.PLAN_CREATE_REQUEST, planCreateRetry);
}

function* watchPlanReconcilePolling() {
  yield takeEvery(PlanActionTypes.PLAN_RECONCILE_POLL, planReconcileWatch);
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
  watchPlanCreate,
  watchPlanUpdate,
  watchPVPolling,
  watchPlanReconcilePolling,
  watchPlanCloseAndDelete,
  watchPlanClose,
  watchClosedStatus,
  watchPlanStatus,
  watchGetPVResourcesRequest
};
