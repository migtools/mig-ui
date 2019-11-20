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
  CoreClusterResource,
  CoreClusterResourceKind,
  MigResourceKind
} from '../../../client/resources';
import Q from 'q';

const PlanUpdateTotalTries = 6;
const PlanUpdateRetryPeriodSeconds = 5;

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
function* patchPlanSaga(planValues) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.hostCluster(state);
  try {
    const getPlanRes = yield call(getPlanSaga, planValues.planName);
    const closedPlanSpecObj = {
      spec: {
        closed: true
      }
    };
    yield client.patch(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      getPlanRes.data.metadata.name,
      closedPlanSpecObj
    );
    yield delay(5000);
    yield put(PlanActions.planUpdateSuccess());
    const getPlanResponse = yield call(getPlanSaga, planValues.planName);
    const updatedPlan = getPlanResponse.data;
    yield put(PlanActions.updatePlanList(updatedPlan));
    yield put(PlanActions.startPlanStatusPolling(planValues.planName));
  } catch (err) {
    yield put(PlanActions.planUpdateFailure(err));
    throw err;
  }
}


function* planUpdateRetry(action) {
  try {
    yield put(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.Pending }));
    yield retry(
      PlanUpdateTotalTries,
      PlanUpdateRetryPeriodSeconds * 1000,
      function* (planValues, isRerunPVDiscovery) {
        const state = yield select();
        const migMeta = state.migMeta;
        const client: IClusterClient = ClientFactory.hostCluster(state);
        try {
          yield put(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.Pending }));
          const getPlanRes = yield call(getPlanSaga, planValues.planName);
          const updatedMigPlan = updateMigPlanFromValues(getPlanRes.data, planValues, isRerunPVDiscovery);
          if (isRerunPVDiscovery) {
            if (
              JSON.stringify(getPlanRes.data.spec.namespaces) !==
              JSON.stringify(planValues.selectedNamespaces) ||
              JSON.stringify(getPlanRes.data.spec.destMigClusterRef.name) !==
              JSON.stringify(planValues.targetCluster) ||
              JSON.stringify(getPlanRes.data.spec.srcMigClusterRef.name) !==
              JSON.stringify(planValues.sourceCluster)
            ) {
              yield client.patch(
                new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
                getPlanRes.data.metadata.name,
                updatedMigPlan
              );
              yield delay(5000);
              yield put(PlanActions.planUpdateSuccess());
              yield put(PlanActions.pvUpdateRequest());
              yield take(PlanActionTypes.PV_UPDATE_SUCCESS);
            } else {
              const getPlanResponse = yield call(getPlanSaga, planValues.planName);
              const updatedPlan = getPlanResponse.data;
              yield put(PlanActions.updatePlanList(updatedPlan));
              yield put(PlanActions.startPlanStatusPolling(planValues.planName));

            }
          } else {
            yield client.patch(
              new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
              getPlanRes.data.metadata.name,
              updatedMigPlan
            );
            yield delay(5000);
            const getPlanResponse = yield call(getPlanSaga, planValues.planName);
            const updatedPlan = getPlanResponse.data;
            yield put(PlanActions.updatePlanList(updatedPlan));
            yield put(PlanActions.startPlanStatusPolling(planValues.planName));
          }

        } catch (err) {
          yield put(PlanActions.planUpdateFailure(err));
          throw err;
        }
      },
      action.planValues,
      action.isRerunPVDiscovery
    );
  } catch (error) {
    yield put(PlanActions.planUpdateFailure(error));
  }
}

function* checkClosedStatus(action) {
  let planClosed = false;
  let tries = 0;
  const TicksUntilTimeout = 8;
  while (!planClosed) {
    if (tries < TicksUntilTimeout) {
      tries += 1;
      const getPlanResponse = yield call(getPlanSaga, action.planName);
      const MigPlan = getPlanResponse.data;

      if (MigPlan.status && MigPlan.status.conditions) {
        const hasClosedCondition = !!MigPlan.status.conditions.some(c => c.type === 'Closed');
        if (hasClosedCondition) {
          yield put(PlanActions.planCloseSuccess());
          yield put(PlanActions.stopClosedStatusPolling(action.planName));
        }
      }
    } else {
      planClosed = true;
      yield put(PlanActions.planCloseFailure('Failed to close plan'));
      yield put(AlertActions.alertErrorTimeout('Timed out during plan close'));
      yield put(PlanActions.stopClosedStatusPolling(action.planName));
      break;
    }

    const PollingInterval = 5000;
    yield delay(PollingInterval);
  }
}
const isUpdatedPlan = (currMigPlan, prevMigPlan) => {
  const corePlan = (plan) => {
    const { metadata } = plan;
    if (metadata.annotations || metadata.resourceVersion) {
      delete metadata.annotations;
      delete metadata.resourceVersion;
    }
  };


  const currMigPlanCore = corePlan(currMigPlan);
  const prevMigPlanCore = corePlan(prevMigPlan);
  if (JSON.stringify(currMigPlanCore) !== JSON.stringify(prevMigPlanCore)) {
    return true;
  } else {
    return false;
  }
};

function* checkUpdatedPVs() {
  let pvUpdateComplete = false;
  let tries = 0;
  const TicksUntilTimeout = 240;
  while (!pvUpdateComplete) {
    if (tries < TicksUntilTimeout) {
      tries += 1;
      const state = yield select();
      const { currentPlan } = state.plan;

      const getPlanResponse = yield call(getPlanSaga, currentPlan.metadata.name);
      const updatedPlan = getPlanResponse.data;

      if (updatedPlan) {
        const isUpdatedPVList = () => {

          const updatedGeneration = updatedPlan.metadata.generation;
          const oldGeneration = currentPlan.metadata.generation;

          //Generation check incremented twice: once for ui change, once for controller change. 
          return updatedGeneration >= oldGeneration + 2;
        };

        if (isUpdatedPVList()) {
          yield put(PlanActions.setCurrentPlan(updatedPlan));
          yield put(PlanActions.pvUpdateSuccess());
          yield put(PlanActions.updatePlanList(updatedPlan));
          yield put(PlanActions.startPlanStatusPolling(updatedPlan.metadata.name));

          pvUpdateComplete = true;
        }
      }
    }
    else {
      yield put(AlertActions.alertErrorTimeout('Timed out during PV discovery'));
      //failed to update
      yield put(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.TimedOut }));

      pvUpdateComplete = true;
      break;
    }

    const PollingInterval = 1000;
    yield delay(PollingInterval);
  }
}
function* checkPlanStatus(action) {
  let planStatusComplete = false;
  let tries = 0;
  const TicksUntilTimeout = 10;
  while (!planStatusComplete) {
    if (tries < TicksUntilTimeout) {
      yield put(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.Pending }));
      tries += 1;
      const getPlanResponse = yield call(getPlanSaga, action.planName);
      const updatedPlan = getPlanResponse.data;

      //diff current plan before setting
      const state = yield select();
      const { currentPlan } = state.plan;
      if (!currentPlan || isUpdatedPlan(updatedPlan, currentPlan)) {
        yield put(PlanActions.setCurrentPlan(updatedPlan));
      }
      if (updatedPlan.status && updatedPlan.status.conditions) {
        const hasReadyCondition = !!updatedPlan.status.conditions.some(c => c.type === 'Ready');
        const hasErrorCondition = !!updatedPlan.status.conditions.some(cond => {
          return cond.category === 'Error';
        });
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
        if (hasErrorCondition) {
          const errorCond = updatedPlan.status.conditions.find(cond => {
            return cond.category === 'Error';
          });
          yield put(PlanActions.updateCurrentPlanStatus(
            { state: CurrentPlanState.Critical, errorMessage: errorCond.message }
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
      }
    } else {
      planStatusComplete = true;
      yield put(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.TimedOut }));
      yield put(PlanActions.stopPlanStatusPolling());
      break;
    }

    const PollingInterval = 5000;
    yield delay(PollingInterval);
  }
}

function* planCloseSaga(action) {
  try {
    const updatedValues = {
      planName: action.planName,
      planClosed: true,
      persistentVolumes: []
    };
    yield retry(
      PlanUpdateTotalTries,
      PlanUpdateRetryPeriodSeconds * 1000,
      patchPlanSaga,
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

function* watchPlanUpdate() {
  yield takeEvery(PlanActionTypes.PLAN_UPDATE_REQUEST, planUpdateRetry);
}

function* watchPVUpdate() {
  yield takeEvery(PlanActionTypes.PV_UPDATE_REQUEST, checkUpdatedPVs);
}


function* watchGetPVResourcesRequest() {
  yield takeLatest(PlanActionTypes.GET_PV_RESOURCES_REQUEST, getPVResourcesRequest);
}

function* watchPlanClose() {
  yield takeLatest(PlanActionTypes.PLAN_CLOSE_REQUEST, planCloseSaga);
}

export default {
  watchPlanUpdate,
  watchPlanCloseAndDelete,
  watchPlanClose,
  watchClosedStatus,
  watchPlanStatus,
  watchGetPVResourcesRequest,
  watchPVUpdate
};
