import { takeEvery, takeLatest, select, retry, race, call, delay, put, take } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IDiscoveryClient } from '../../../client/discoveryClient';
import { IClusterClient } from '../../../client/client';
import { PersistentVolumeDiscovery } from '../../../client/resources/discovery';
import { updateMigPlanFromValues } from '../../../client/resources/conversions';
import {
  AlertActions,
} from '../../common/duck/actions';
import { PlanActions, PlanActionTypes } from './actions';
import { CurrentPlanState } from './reducers';
import {
  MigResource,
  MigResourceKind
} from '../../../client/resources';
import Q from 'q';
import utils from '../../common/duck/utils';
import { NamespaceDiscovery } from '../../../client/resources/discovery';
import { DiscoveryResource } from '../../../client/resources/common';
import { AuthActions } from '../../auth/duck/actions';
import { push } from 'connected-react-router';

const PlanUpdateTotalTries = 6;
const PlanUpdateRetryPeriodSeconds = 5;

function* namespaceFetchRequest(action) {
  const state = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const namespaces: DiscoveryResource = new NamespaceDiscovery(action.clusterName);
  try {
    const res = yield discoveryClient.get(namespaces);
    // const namespaces = res.data.resources.map(namespaceName => ({
    //   name: namespaceName
    // }));
    const namespaceResourceList = res.data.resources;
    yield put(PlanActions.namespaceFetchSuccess(namespaceResourceList));
  } catch (err) {
    if (utils.isTimeoutError(err)) {
      yield put(AlertActions.alertErrorTimeout('Timed out while fetching namespaces'));
    } else if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}/${namespaces.path()}`;
      yield put(AuthActions.certErrorOccurred(failedUrl));
      yield put(push('/cert-error'));
    }
    yield put(PlanActions.namespaceFetchFailure(err));
    yield put(AlertActions.alertErrorTimeout('Failed to fetch namespaces'));
  }
}

function* getPlanSaga(planName) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.cluster(state);
  return yield client.get(
    new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
    planName
  );
}
function* planPatchClose(planValues) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.cluster(state);
  try {
    const getPlanRes = yield call(getPlanSaga, planValues.planName);
    if (getPlanRes.data.spec.closed) { return; }
    const closedPlanSpecObj = {
      spec: {
        closed: true
      }
    };
    const patchPlanResponse = yield client.patch(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      getPlanRes.data.metadata.name,
      closedPlanSpecObj
    );
    yield put(PlanActions.updatePlanList(patchPlanResponse.data));
    yield put(PlanActions.planUpdateSuccess());
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
        const client: IClusterClient = ClientFactory.cluster(state);
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
              JSON.stringify(getPlanRes.data.spec.srcMigClusterRef.name) !== JSON.stringify(planValues.sourceCluster)
            ) {
              const updatedPlanRes = yield client.patch(
                new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
                getPlanRes.data.metadata.name,
                updatedMigPlan
              );
              yield put(PlanActions.planUpdateSuccess());
              yield put(PlanActions.pvUpdateRequest(isRerunPVDiscovery));
              yield take(PlanActionTypes.PV_UPDATE_SUCCESS);
            } else {
              yield put(PlanActions.pvUpdateRequest(false));
              yield take(PlanActionTypes.PV_UPDATE_SUCCESS);

            }
          } else {
            yield client.patch(
              new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
              getPlanRes.data.metadata.name,
              updatedMigPlan
            );
            yield put(PlanActions.pvUpdateRequest(isRerunPVDiscovery));
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
  const PollingInterval = 5000;
  const TicksUntilTimeout = 16;
  for (let tries = 0; tries < TicksUntilTimeout; tries++) {
    const getPlanResponse = yield call(getPlanSaga, action.planName);
    const MigPlan = getPlanResponse.data;

    if (MigPlan.status && MigPlan.status.conditions) {
      const hasClosedCondition = !!MigPlan.status.conditions.some(c => c.type === 'Closed');
      if (hasClosedCondition) {
        yield put(PlanActions.planCloseSuccess(action.planName));
        return;
      }
    }

    yield delay(PollingInterval);
  }

  yield put(PlanActions.planCloseFailure('Failed to close plan', action.planName));
  yield put(AlertActions.alertErrorTimeout(`Timed out during plan close ${action.planName}`));
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

function* checkUpdatedPVs(action) {
  let pvUpdateComplete = false;
  let tries = 0;
  const TicksUntilTimeout = 240;
  const { isRerunPVDiscovery } = action;
  while (!pvUpdateComplete) {
    if (tries < TicksUntilTimeout) {
      tries += 1;
      const state = yield select();
      const { currentPlan } = state.plan;
      let updatedPlan = null;
      if (currentPlan) {
        const getPlanResponse = yield call(getPlanSaga, currentPlan.metadata.name);
        updatedPlan = getPlanResponse.data;
      }

      if (updatedPlan) {
        const isUpdatedPVList = () => {

          const updatedGeneration = updatedPlan.metadata.generation;
          const oldGeneration = currentPlan.metadata.generation;

          //Generation check incremented twice: once for ui change, once for controller change. 
          if (isRerunPVDiscovery) {
            return updatedGeneration >= oldGeneration + 2;
          } else {
            return updatedGeneration > 1;
          }
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
          yield put(PlanActions.stopPlanStatusPolling(action.planName));
        }
        if (hasCriticalCondition) {
          const criticalCond = updatedPlan.status.conditions.find(cond => {
            return cond.category === 'Critical';
          });
          yield put(PlanActions.updateCurrentPlanStatus(
            { state: CurrentPlanState.Critical, errorMessage: criticalCond.message }
          ));

          yield put(PlanActions.stopPlanStatusPolling(action.planName));
        }
        if (hasErrorCondition) {
          const errorCond = updatedPlan.status.conditions.find(cond => {
            return cond.category === 'Error';
          });
          yield put(PlanActions.updateCurrentPlanStatus(
            { state: CurrentPlanState.Critical, errorMessage: errorCond.message }
          ));

          yield put(PlanActions.stopPlanStatusPolling(action.planName));
        }

        if (hasConflictCondition) {
          const conflictCond = updatedPlan.status.conditions.find(cond => {
            return cond.type === 'PlanConflict';
          });
          yield put(PlanActions.updateCurrentPlanStatus(
            { state: CurrentPlanState.Critical, errorMessage: conflictCond.message }
          ));

          yield put(PlanActions.stopPlanStatusPolling(action.planName));
        }
      }
    } else {
      planStatusComplete = true;
      yield put(PlanActions.updateCurrentPlanStatus({ state: CurrentPlanState.TimedOut }));
      yield put(PlanActions.stopPlanStatusPolling(action.planName));
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
      planPatchClose,
      updatedValues,
    );
  } catch (err) {
    yield put(PlanActions.planCloseFailure(err, action.planName));
    yield put(AlertActions.alertErrorTimeout('Plan close request failed'));
  }
}

function* planDeleteAfterClose(planName) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.cluster(state);
  yield client.delete(
    new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
    planName,
  );
}

function* planCloseAndDelete(action) {
  try {
    yield call(planCloseSaga, action);
    yield call(checkClosedStatus, action);
    yield call(planDeleteAfterClose, action.planName);
    yield put(PlanActions.planCloseAndDeleteSuccess(action.planName));
    yield put(AlertActions.alertSuccessTimeout(`Successfully removed plan "${action.planName}"!`));
  } catch (err) {
    yield put(PlanActions.planCloseAndDeleteFailure(err, action.planName));
    yield put(AlertActions.alertErrorTimeout(`Plan delete request failed for plan "${action.planName}"`));
  }
}


function* planCloseAndCheck(action) {
  try {
    yield call(planCloseSaga, action);
    yield call(checkClosedStatus, action);
  } catch (err) {
    yield put(PlanActions.planCloseFailure(err, action.planName));
  }
}

function* getPVResourcesRequest(action) {
  const state = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  try {
    const pvResourceRefs = action.pvList.map(pv => {
      const persistentVolume = new PersistentVolumeDiscovery(pv.name, action.clusterName);
      return discoveryClient.get(persistentVolume);
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
    if (utils.isTimeoutError(err)) {
      yield put(AlertActions.alertErrorTimeout('Timed out while fetching namespaces'));
    }
    yield put(PlanActions.getPVResourcesFailure('Failed to get pv details'));
  }
}

function* watchPlanCloseAndDelete() {
  yield takeEvery(PlanActionTypes.PLAN_CLOSE_AND_DELETE_REQUEST, planCloseAndDelete);
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
  while (true) {
    const data = yield take(PlanActionTypes.PV_UPDATE_REQUEST);
    yield race([call(checkUpdatedPVs, data), take(PlanActionTypes.PV_UPDATE_POLL_STOP)]);
  }
}

function* watchGetPVResourcesRequest() {
  yield takeLatest(PlanActionTypes.GET_PV_RESOURCES_REQUEST, getPVResourcesRequest);
}

function* watchNamespaceFetchRequest() {
  yield takeLatest(PlanActionTypes.NAMESPACE_FETCH_REQUEST, namespaceFetchRequest);
}

function* watchPlanClose() {
  yield takeEvery(PlanActionTypes.PLAN_CLOSE_REQUEST, planCloseAndCheck);
}

export default {
  watchPlanUpdate,
  watchPlanCloseAndDelete,
  watchPlanClose,
  watchPlanStatus,
  watchGetPVResourcesRequest,
  watchNamespaceFetchRequest,
  watchPVUpdate
};
