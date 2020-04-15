import { takeEvery, takeLatest, select, retry, race, call, delay, put, take } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IDiscoveryClient } from '../../../client/discoveryClient';
import { IClusterClient } from '../../../client/client';
import { PersistentVolumeDiscovery } from '../../../client/resources/discovery';
import {
  updateMigPlanFromValues,
  createInitialMigPlan,
  createMigMigration,
  createMigHook,
  updateMigHook,
  getTokenSecretLabelSelector,
} from '../../../client/resources/conversions';
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
import { push } from 'connected-react-router'
import planUtils from './utils';
import {
  createAddEditStatus,
  AddEditState,
  AddEditMode,
  IAddEditStatus,
  AddEditWatchTimeout,
  AddEditWatchTimeoutPollInterval,
  AddEditConditionCritical,
  createAddEditStatusWithMeta,
  AddEditConditionReady,
  AddEditDebounceWait,
} from '../../common/add_edit_state';
import { createHook } from 'async_hooks';

const uuidv1 = require('uuid/v1');
const PlanMigrationPollingInterval = 5000;

const PlanUpdateTotalTries = 6;
const PlanUpdateRetryPeriodSeconds = 5;

/******************************************************************** */
/* Plan sagas */
/******************************************************************** */
function* addPlanSaga(action) {
  const { migPlan } = action;
  try {
    const state = yield select();
    const { migMeta } = state;
    const client: IClusterClient = ClientFactory.cluster(state);

    const migPlanObj = createInitialMigPlan(
      migPlan.planName,
      migMeta.namespace,
      migPlan.sourceCluster,
      migPlan.targetCluster,
      migPlan.selectedStorage,
      migPlan.namespaces
    );

    const createPlanRes = yield client.create(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      migPlanObj
    );

    yield put(PlanActions.setCurrentPlan(createPlanRes.data));
    yield put(PlanActions.addPlanSuccess(createPlanRes.data));

  } catch (err) {
    yield put(AlertActions.alertErrorTimeout('Failed to add plan'));
  }
}



function* namespaceFetchRequest(action) {
  const state = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const namespaces: DiscoveryResource = new NamespaceDiscovery(action.clusterName);
  try {
    const res = yield discoveryClient.get(namespaces);
    const namespaceResourceList = res.data.resources;
    yield put(PlanActions.namespaceFetchSuccess(namespaceResourceList));
  } catch (err) {
    if (utils.isTimeoutError(err)) {
      yield put(AlertActions.alertErrorTimeout('Timed out while fetching namespaces'));
    } else if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}/${namespaces.path()}`;
      yield put(AuthActions.certErrorOccurred(failedUrl));
      yield put(push('/cert-error'));
      return;
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

function* migrationCancel(action) {
  const state = yield select();
  const migMeta = state.migMeta;
  const client: IClusterClient = ClientFactory.cluster(state);
  try {
    const migration = yield client.get(
      new MigResource(MigResourceKind.MigMigration, migMeta.namespace),
      action.migrationName
    );
    if (migration.data.spec.canceled) { return; }
    const canceledMigrationSpec = {
      spec: {
        canceled: true
      }
    };
    yield client.patch(
      new MigResource(MigResourceKind.MigMigration, migMeta.namespace),
      action.migrationName,
      canceledMigrationSpec
    );
    yield put(PlanActions.migrationCancelSuccess(action.migrationName));
    yield put(AlertActions.alertSuccessTimeout(`Cancel requested for "${action.migrationName}"!`));
  } catch (err) {
    yield put(PlanActions.migrationCancelFailure(err, action.migrationName));
    yield put(AlertActions.alertErrorTimeout(`Failed to cancel "${action.migrationName}"`));
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

function* fetchPlansGenerator() {

  function fetchMigMigrationsRefs(client: IClusterClient, migMeta, migPlans): Array<Promise<any>> {
    const refs: Array<Promise<any>> = [];

    migPlans.forEach(plan => {
      const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);
      refs.push(client.list(migMigrationResource));
    });

    return refs;
  }

  const state = yield select();
  const client: IClusterClient = ClientFactory.cluster(state);
  const resource = new MigResource(MigResourceKind.MigPlan, state.migMeta.namespace);
  try {
    let planList = yield client.list(resource);
    planList = yield planList.data.items;
    const refs = yield Promise.all(fetchMigMigrationsRefs(client, state.migMeta, planList));
    const groupedPlans = yield planUtils.groupPlans(planList, refs);
    return { updatedPlans: groupedPlans };
  } catch (e) {
    throw e;
  }
}

/******************************************************************** */
/* Stage sagas */
/******************************************************************** */

function getStageStatusCondition(updatedPlans, createMigRes) {
  const matchingPlan = updatedPlans.updatedPlans.find(
    p => p.MigPlan.metadata.name === createMigRes.data.spec.migPlanRef.name
  );
  const statusObj = { status: null, planName: null, errorMessage: null };

  if (matchingPlan && matchingPlan.Migrations) {
    const matchingMigration = matchingPlan.Migrations.find(
      s => s.metadata.name === createMigRes.data.metadata.name
    );


    if (matchingMigration && matchingMigration.status) {
      const hasSucceededCondition = !!matchingMigration.status.conditions.some(
        c => c.type === 'Succeeded'
      );
      if (hasSucceededCondition) {
        statusObj.status = 'SUCCESS'
      }
      statusObj.planName = matchingPlan.MigPlan.metadata.name;
      const hasErrorCondition = !!matchingMigration.status.conditions.some(c => c.type === 'Failed' || c.category === 'Critical');
      const errorCondition = matchingMigration.status.conditions.find(c => c.type === 'Failed' || c.category === 'Critical');
      if (hasErrorCondition) {
        statusObj.status = 'FAILURE'
        statusObj.errorMessage = errorCondition.message;
      }
    }
  }
  return statusObj;

}
function* runStageSaga(action) {
  try {
    const state = yield select();
    const { migMeta } = state;
    const client: IClusterClient = ClientFactory.cluster(state);
    const { plan } = action;

    yield put(PlanActions.initStage(plan.MigPlan.metadata.name));
    yield put(AlertActions.alertProgressTimeout('Staging Started'));

    const migMigrationObj = createMigMigration(
      uuidv1(),
      plan.MigPlan.metadata.name,
      migMeta.namespace,
      true,
      true
    );
    const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);

    //created migration response object
    const createMigRes = yield client.create(migMigrationResource, migMigrationObj);
    const migrationListResponse = yield client.list(migMigrationResource);
    const groupedPlan = planUtils.groupPlan(plan, migrationListResponse);


    const params = {
      fetchPlansGenerator: fetchPlansGenerator,
      delay: PlanMigrationPollingInterval,
      getStageStatusCondition: getStageStatusCondition,
      createMigRes: createMigRes,
    };

    yield put(PlanActions.startStagePolling(params));
    yield put(PlanActions.updatePlanMigrations(groupedPlan));
  } catch (err) {
    yield put(AlertActions.alertErrorTimeout(err));
    yield put(PlanActions.stagingFailure(err));
  }
}

function* stagePoll(action) {
  const params = { ...action.params };
  while (true) {
    const updatedPlans = yield call(params.fetchPlansGenerator);
    const pollingStatusObj = params.getStageStatusCondition(updatedPlans, params.createMigRes);

    switch (pollingStatusObj.status) {
      case 'SUCCESS':
        yield put(PlanActions.stagingSuccess(pollingStatusObj.planName));
        yield put(AlertActions.alertSuccessTimeout('Staging Successful'));
        yield put(PlanActions.stopStagePolling());
        break;
      case 'FAILURE':
        yield put(PlanActions.stagingFailure(pollingStatusObj.error));
        yield put(AlertActions.alertErrorTimeout(`${pollingStatusObj.errorMessage || 'Staging Failed'}`));
        yield put(PlanActions.stopStagePolling());
        break;
      default:
        break;
    }
    yield delay(params.delay);
  }
}

/******************************************************************** */
/* Migration sagas */
/******************************************************************** */

function getMigrationStatusCondition(updatedPlans, createMigRes) {
  const matchingPlan = updatedPlans.updatedPlans.find(
    p => p.MigPlan.metadata.name === createMigRes.data.spec.migPlanRef.name
  );
  const statusObj = { status: null, planName: null, errorMessage: null };

  if (matchingPlan && matchingPlan.Migrations) {
    const matchingMigration = matchingPlan.Migrations.find(
      s => s.metadata.name === createMigRes.data.metadata.name
    );


    if (matchingMigration && matchingMigration.status) {
      const hasSucceededCondition = !!matchingMigration.status.conditions.some(
        c => c.type === 'Succeeded'
      );
      const hasCanceledCondition = !!matchingMigration.status.conditions.some(
        c => c.type === 'Canceled'
      )
      if (hasCanceledCondition) {
        statusObj.status = 'CANCELED'
      } else if (hasSucceededCondition) {
        statusObj.status = 'SUCCESS'
      }
      statusObj.planName = matchingPlan.MigPlan.metadata.name;
      const hasErrorCondition = !!matchingMigration.status.conditions.some(c => c.type === 'Failed' || c.category === 'Critical');
      const errorCondition = matchingMigration.status.conditions.find(c => c.type === 'Failed' || c.category === 'Critical');
      if (hasErrorCondition) {
        statusObj.status = 'FAILURE'
        statusObj.errorMessage = errorCondition.message;
      }
    }
  }
  return statusObj;


}

function* runMigrationSaga(action) {
  try {
    const { plan, disableQuiesce } = action;
    const state = yield select();
    const { migMeta } = state;
    const client: IClusterClient = ClientFactory.cluster(state);
    yield put(PlanActions.initMigration(plan.MigPlan.metadata.name));
    yield put(AlertActions.alertProgressTimeout('Migration Started'));

    const migMigrationObj = createMigMigration(
      uuidv1(),
      plan.MigPlan.metadata.name,
      migMeta.namespace,
      false,
      disableQuiesce
    );
    const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);

    //created migration response object
    const createMigRes = yield client.create(migMigrationResource, migMigrationObj);

    const migrationListResponse = yield client.list(migMigrationResource);
    const groupedPlan = planUtils.groupPlan(plan, migrationListResponse);


    const params = {
      fetchPlansGenerator: fetchPlansGenerator,
      delay: PlanMigrationPollingInterval,
      getMigrationStatusCondition: getMigrationStatusCondition,
      createMigRes: createMigRes,
    };

    yield put(PlanActions.startMigrationPolling(params));
    yield put(PlanActions.updatePlanMigrations(groupedPlan));
  } catch (err) {
    yield put(AlertActions.alertErrorTimeout(err));
    yield put(PlanActions.migrationFailure(err));
  }
}
function* migrationPoll(action) {
  const params = { ...action.params };
  while (true) {
    const updatedPlans = yield call(params.fetchPlansGenerator);
    const pollingStatusObj = params.getMigrationStatusCondition(updatedPlans, params.createMigRes);

    switch (pollingStatusObj.status) {
      case 'CANCELED':
        yield put(AlertActions.alertSuccessTimeout('Migration canceled'));
        yield put(PlanActions.stopMigrationPolling());
        break;
      case 'SUCCESS':
        yield put(PlanActions.migrationSuccess(pollingStatusObj.planName));
        yield put(AlertActions.alertSuccessTimeout('Migration Successful'));
        yield put(PlanActions.stopMigrationPolling());
        break;
      case 'FAILURE':
        yield put(PlanActions.migrationFailure(pollingStatusObj.error));
        yield put(AlertActions.alertErrorTimeout(`${pollingStatusObj.errorMessage || 'Migration Failed'}`));
        yield put(PlanActions.stopMigrationPolling());
        break;
      default:
        break;
    }
    yield delay(params.delay);
  }
}

/******************************************************************** */
//Hooks sagas
/******************************************************************** */

function* fetchHooksSaga(action) {
  const state = yield select();
  try {
    const { migMeta } = state;
    const client: IClusterClient = ClientFactory.cluster(state);
    const migHookResource = new MigResource(MigResourceKind.MigHook, migMeta.namespace);
    const { currentPlan } = state.plan
    const getPlanRes = yield call(getPlanSaga, currentPlan.metadata.name);
    const currentPlanHooks = getPlanRes.data.spec.hooks;

    const hookList = yield client.list(migHookResource);
    const associatedHooks = []
    if (currentPlanHooks) {
      currentPlanHooks.forEach((currentPlanHookRef) => hookList.data.items.forEach((hookRef) => {
        if (currentPlanHookRef.reference.name === hookRef.metadata.name) {
          const hookImageType = hookRef.spec.custom ? 'custom' : 'ansible'
          const customContainerImage = hookRef.spec.custom ? hookRef.spec.image : null;
          const ansibleRuntimeImage = !hookRef.spec.custom ? hookRef.spec.image : null;
          const srcServiceAccountName = hookRef.spec.targetCluster === 'source' ? currentPlanHookRef.serviceAccount : null;
          const srcServiceAccountNamespace = hookRef.spec.targetCluster === 'source' ? currentPlanHookRef.executionNamespace : null;
          const destServiceAccountName = hookRef.spec.targetCluster === 'destination' ? currentPlanHookRef.serviceAccount : null;
          const destServiceAccountNamespace = hookRef.spec.targetCluster === 'destination' ? currentPlanHookRef.executionNamespace : null;

          let ansibleFile;
          if (!hookRef.spec.custom) {
            ansibleFile = atob(hookRef.spec.playbook);
          }

          const uiHookObject = {
            hookName: hookRef.metadata.name,
            hookImageType,
            customContainerImage,
            ansibleRuntimeImage,
            ansibleFile,
            clusterType: hookRef.spec.targetCluster,
            srcServiceAccountName,
            srcServiceAccountNamespace,
            destServiceAccountName,
            destServiceAccountNamespace,
            phase: currentPlanHookRef.phase,
            image: hookRef.spec.image,
            custom: hookRef.spec.custom
          }
          associatedHooks.push(uiHookObject)
        }
      }
      ))
    }
    yield put(PlanActions.hookFetchSuccess(associatedHooks));
  } catch (err) {
    yield put(PlanActions.hookFetchFailure());
    yield put(AlertActions.alertErrorTimeout('Failed to fetch hooks'));
  }
}


function* addHookSaga(action) {
  const { migHook } = action;
  try {
    const state = yield select();
    const { migMeta } = state;
    const client: IClusterClient = ClientFactory.cluster(state);

    // add hook
    const migHookObj = createMigHook(
      migHook,
      migMeta.namespace
    );
    const createHookRes = yield client.create(
      new MigResource(MigResourceKind.MigHook, migMeta.namespace),
      migHookObj
    );
    yield put(PlanActions.addHookSuccess(createHookRes.data));

    // associate  hook to plan
    const { currentPlan } = state.plan
    const getPlanRes = yield call(getPlanSaga, currentPlan.metadata.name);
    const currentPlanSpec = getPlanRes.data.spec;

    const createHooksSpec = () => {
      const updatedSpec = Object.assign({}, currentPlanSpec);

      const getServiceAccountNamespace = (clusterType) => {
        if (clusterType === 'source') {
          return migHook.srcServiceAccountNamespace;
        }
        if (clusterType === 'destination') {
          return migHook.destServiceAccountNamespace;
        }
      }

      const getServiceAccountName = (clusterType) => {
        if (clusterType === 'source') {
          return migHook.srcServiceAccountName;
        }
        if (clusterType === 'destination') {
          return migHook.destServiceAccountName;
        }
      }
      const executionNamespace = getServiceAccountNamespace(migHook.clusterType);
      const { name, namespace } = createHookRes.data.metadata

      const newHook = {
        executionNamespace: executionNamespace,
        phase: migHook.migrationStep,
        reference: {
          name: name,
          namespace: namespace
        },
        serviceAccount: getServiceAccountName(migHook.clusterType)
      }

      if (updatedSpec.hooks) {
        const isExistingPhase = updatedSpec.hooks.some((hook) => { hook.phase === migHook.migrationStep })
        if (!isExistingPhase) {
          updatedSpec.hooks.push(newHook)
        }
      } else {
        updatedSpec.hooks = [newHook]
      }

      const updatedHooksSpec = {
        spec: updatedSpec
      }
      return updatedHooksSpec
    }

    const patchPlanRes = yield client.patch(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      currentPlan.metadata.name,
      createHooksSpec()
    );

    yield put(PlanActions.setCurrentPlan(patchPlanRes.data));
    yield put(PlanActions.hookFetchRequest(patchPlanRes.data.spec.hooks));
    yield put(AlertActions.alertSuccessTimeout('Successfully added a hook to plan.'));
  } catch {
    yield put(AlertActions.alertErrorTimeout('Failed to add hook.'));
  }
}


function* pollHookAddEditStatus(action) {
  // Give the controller some time to bounce
  yield delay(AddEditDebounceWait);
  while (true) {
    try {
      const state = yield select();
      const { migMeta } = state;
      const { hookName } = action;

      const client: IClusterClient = ClientFactory.cluster(state);
      const migHookResource = new MigResource(MigResourceKind.MigHook, migMeta.namespace);
      const hookPollResult = yield client.get(migHookResource, hookName);

      const hasStatusAndConditions =
        hookPollResult.data.status &&
        hookPollResult.data.status.conditions;

      if (hasStatusAndConditions) {
        const criticalCond = hookPollResult.data.status.conditions.find(cond => {
          return cond.category === AddEditConditionCritical;
        });

        if (criticalCond) {
          return createAddEditStatusWithMeta(
            AddEditState.Critical,
            AddEditMode.Edit,
            criticalCond.message,
            criticalCond.reason,
          );
        }

        const readyCond = hookPollResult.data.status.conditions.find(cond => {
          return cond.type === AddEditConditionReady;
        });

        if (readyCond) {
          return createAddEditStatusWithMeta(
            AddEditState.Ready,
            AddEditMode.Edit,
            readyCond.message,
            '', // Ready has no reason
          );
        }
      }

      // No conditions found, let's wait a bit and keep checking
      yield delay(AddEditWatchTimeoutPollInterval);
    } catch (err) {
      // TODO: what happens when the poll fails? Back into that hard error state?
      console.error('Hard error branch hit in poll hook add edit', err);
      return;
    }
  }
}

function* removeHookSaga(action) {
  try {
    const state = yield select();
    const { migMeta } = state;
    const { name } = action;
    const client: IClusterClient = ClientFactory.cluster(state);

    const migHookResource = new MigResource(MigResourceKind.MigHook, migMeta.namespace);

    yield client.delete(
      migHookResource,
      name,
    );

    yield put(PlanActions.removeHookSuccess(name));
    yield put(AlertActions.alertSuccessTimeout(`Successfully removed hook "${name}"!`));

    const { currentPlan } = state.plan;

    const createHooksSpec = () => {
      const updatedSpec = Object.assign({}, currentPlan.spec);
      if (updatedSpec.hooks) {
        const deletedHookIndex = updatedSpec.hooks.findIndex((hook) => hook.reference.name === name)
        updatedSpec.hooks.splice(deletedHookIndex, 1);
      }

      const updatedHooksSpec = {
        spec: updatedSpec
      }
      return updatedHooksSpec
    }

    const patchPlanRes = yield client.patch(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      currentPlan.metadata.name,
      createHooksSpec()
    );

    yield put(PlanActions.removeHookSuccess(name));
    yield put(PlanActions.setCurrentPlan(patchPlanRes.data));
    yield put(PlanActions.hookFetchRequest(patchPlanRes.data.spec.hooks));


  } catch (err) {
    yield put(AlertActions.alertErrorTimeout(err));
    yield put(PlanActions.removeHookFailure(err));
  }
}

function* updateHookRequest(action) {
  const state = yield select();
  const { migMeta } = state;
  const { migHook } = action;
  const client: IClusterClient = ClientFactory.cluster(state);

  const currentHook = state.plan.migHookList.find(hook => {
    return hook.hookName === migHook.hookName;
  });

  const { currentPlan } = state.plan;

  const currentPlanHookRef = currentPlan.spec.hooks.find(hook => {
    return hook.reference.name === migHook.hookName;
  })
  const migHookObj = updateMigHook(
    currentHook,
    migHook,
    currentPlanHookRef,
    migMeta.namespace,
    currentPlan
  );
  //need to patch entire hooks array 
  try {
    const patchPlanResponse = yield client.patch(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      currentPlan.metadata.name,
      migHookObj.currentPlanHookRefPatch
    );


    yield client.patch(
      new MigResource(MigResourceKind.MigHook, migMeta.namespace),
      migHook.hookName,
      migHookObj.migHookPatch
    );

    yield put(PlanActions.updateHookSuccess());
    yield put(PlanActions.setCurrentPlan(patchPlanResponse.data));
    yield put(PlanActions.hookFetchRequest(patchPlanResponse.data.spec.hooks));
    yield put(AlertActions.alertSuccessTimeout('Successfully updated hook.'));
    yield put(PlanActions.setHookAddEditStatus(
      createAddEditStatus(AddEditState.Ready, AddEditMode.Add),
    ));

  } catch (err) {
    yield put(AlertActions.alertErrorTimeout('Failed to update hook.'));
    throw err;
  }
}

/******************************************************************** */
/* Saga watchers */
/******************************************************************** */

function* watchUpdateHookRequest() {
  yield takeLatest(PlanActionTypes.UPDATE_HOOK_REQUEST, updateHookRequest);
}

function* watchRemoveHookRequest() {
  yield takeLatest(PlanActionTypes.REMOVE_HOOK_REQUEST, removeHookSaga);
}

function* watchFetchHooksRequest() {
  yield takeLatest(PlanActionTypes.HOOK_FETCH_REQUEST, fetchHooksSaga);
}

function* watchAddHookRequest() {
  yield takeLatest(PlanActionTypes.ADD_HOOK_REQUEST, addHookSaga);
}


function* watchStagePolling() {
  while (true) {
    const data = yield take(PlanActionTypes.STAGE_POLL_START);
    yield race([call(stagePoll, data), take(PlanActionTypes.STAGE_POLL_STOP)]);
  }
}

function* watchMigrationPolling() {
  while (true) {
    const data = yield take(PlanActionTypes.MIGRATION_POLL_START);
    yield race([call(migrationPoll, data), take(PlanActionTypes.MIGRATION_POLL_STOP)]);
  }
}

function* watchMigrationCancel() {
  yield takeEvery(PlanActionTypes.MIGRATION_CANCEL_REQUEST, migrationCancel);
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

function* watchAddPlanRequest() {
  yield takeLatest(PlanActionTypes.ADD_PLAN_REQUEST, addPlanSaga);
}

function* watchRunMigrationRequest() {
  yield takeLatest(PlanActionTypes.RUN_MIGRATION_REQUEST, runMigrationSaga);
}

function* watchRunStageRequest() {
  yield takeLatest(PlanActionTypes.RUN_STAGE_REQUEST, runStageSaga);
}

export default {
  watchStagePolling,
  watchMigrationPolling,
  fetchPlansGenerator,
  watchRunStageRequest,
  watchRunMigrationRequest,
  watchAddPlanRequest,
  watchPlanUpdate,
  watchPlanCloseAndDelete,
  watchPlanStatus,
  watchMigrationCancel,
  watchGetPVResourcesRequest,
  watchNamespaceFetchRequest,
  watchPVUpdate,
  watchAddHookRequest,
  watchFetchHooksRequest,
  watchRemoveHookRequest,
  watchUpdateHookRequest
};
