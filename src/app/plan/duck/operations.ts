import { PlanActions } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { CoreClusterResource, CoreClusterResourceKind } from '../../../client/resources';

import {
  createMigMigration,
  createInitialMigPlan,
  updateMigPlanFromValues,
} from '../../../client/resources/conversions';
import {
  alertProgressTimeout,
  alertSuccessTimeout,
  alertErrorTimeout,
} from '../../common/duck/actions';
import utils from '../../common/duck/utils';
import planUtils from './utils';
import { select } from 'redux-saga/effects';
import { startStatusPolling } from '../../common/duck/actions';

/* tslint:disable */
const uuidv1 = require('uuid/v1');
/* tslint:enable */
const pvFetchRequest = PlanActions.pvFetchRequest;

const PlanMigrationPollingInterval = 5000;

const runStage = plan => {
  return async (dispatch, getState) => {
    try {
      dispatch(PlanActions.initStage(plan.MigPlan.metadata.name));
      dispatch(alertProgressTimeout('Staging Started'));
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const migMigrationObj = createMigMigration(
        uuidv1(),
        plan.MigPlan.metadata.name,
        migMeta.namespace,
        true,
        true
      );
      const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);

      //created migration response object
      const createMigRes = await client.create(migMigrationResource, migMigrationObj);
      const migrationListResponse = await client.list(migMigrationResource);
      const groupedPlan = planUtils.groupPlan(plan, migrationListResponse);

      const getStageStatusCondition = (pollingResponse, newObjectRes) => {
        const matchingPlan = pollingResponse.updatedPlans.find(
          p => p.MigPlan.metadata.name === newObjectRes.data.spec.migPlanRef.name
        );

        const migStatus = matchingPlan
          ? planUtils.getMigrationStatus(matchingPlan, newObjectRes)
          : null;
        if (migStatus.success) {
          dispatch(PlanActions.stagingSuccess(newObjectRes.data.spec.migPlanRef.name));
          dispatch(alertSuccessTimeout('Staging Successful'));
          return 'SUCCESS';
        } else if (migStatus.error) {
          dispatch(PlanActions.stagingFailure(migStatus.error));
          dispatch(alertErrorTimeout('Staging Failed'));
          return 'FAILURE';
        }
      };

      const params = {
        asyncFetch: fetchPlansGenerator,
        delay: PlanMigrationPollingInterval,
        callback: getStageStatusCondition,
        type: 'STAGE',
        statusItem: createMigRes,
        dispatch,
      };

      dispatch(startStatusPolling(params));
      dispatch(PlanActions.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(alertErrorTimeout(err));
      dispatch(PlanActions.stagingFailure(err));
    }
  };
};

const runMigration = (plan, disableQuiesce) => {
  return async (dispatch, getState) => {
    try {
      dispatch(PlanActions.initMigration(plan.MigPlan.metadata.name));
      dispatch(alertProgressTimeout('Migration Started'));
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const migMigrationObj = createMigMigration(
        uuidv1(),
        plan.MigPlan.metadata.name,
        migMeta.namespace,
        false,
        disableQuiesce
      );
      const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);

      //created migration response object
      const createMigRes = await client.create(migMigrationResource, migMigrationObj);

      const migrationListResponse = await client.list(migMigrationResource);
      const groupedPlan = planUtils.groupPlan(plan, migrationListResponse);

      const getMigrationStatusCondition = (pollingResponse, newObjectRes) => {
        const matchingPlan = pollingResponse.updatedPlans.find(
          p => p.MigPlan.metadata.name === newObjectRes.data.spec.migPlanRef.name
        );
        const migStatus = matchingPlan
          ? planUtils.getMigrationStatus(matchingPlan, newObjectRes)
          : null;
        if (migStatus.success) {
          dispatch(PlanActions.migrationSuccess(newObjectRes.data.spec.migPlanRef.name));
          dispatch(alertSuccessTimeout('Migration Successful'));
          return 'SUCCESS';
        } else if (migStatus.error) {
          dispatch(PlanActions.migrationFailure(migStatus.error));
          dispatch(alertErrorTimeout('Migration Failed'));
          return 'FAILURE';
        }
      };

      const params = {
        asyncFetch: fetchPlansGenerator,
        delay: PlanMigrationPollingInterval,
        callback: getMigrationStatusCondition,
        type: 'MIGRATION',
        statusItem: createMigRes,
        dispatch,
      };

      dispatch(startStatusPolling(params));
      dispatch(PlanActions.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(alertErrorTimeout(err));
      dispatch(PlanActions.migrationFailure(err));
    }
  };
};

const addPlan = migPlan => {
  return async (dispatch, getState) => {
    try {
      /**
       * Trigger the pv fetch request to initiate loading screen for the VolumesTable component
       */
      dispatch(pvFetchRequest());
      /**
       * Create the plan object. Blocks all code in this function until createPlanRes
       */
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const migPlanObj = createInitialMigPlan(
        migPlan.planName,
        migMeta.namespace,
        migPlan.sourceCluster,
        migPlan.targetCluster,
        migPlan.selectedStorage,
        migPlan.namespaces
      );

      const createPlanRes = await client.create(
        new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
        migPlanObj
      );

      /**
       * Begin PV polling when adding a plan.
       * This is triggered when the user navigates to the pv discovery part of the plan
       * because the discovery is dependent on the creation of a plan
       */

      const getPVs = (updatedPlansPollingResponse, newObjectRes) => {
        const matchingPlan = updatedPlansPollingResponse.updatedPlans.find(
          p => p.MigPlan.metadata.name === newObjectRes.data.metadata.name
        );

        const pvSearchStatus = matchingPlan ? planUtils.getPlanPVs(matchingPlan) : null;
        if (pvSearchStatus.success) {
          dispatch(PlanActions.updatePlan(matchingPlan.MigPlan));
          dispatch(PlanActions.pvFetchSuccess());
          return 'SUCCESS';
        } else if (pvSearchStatus.error) {
          return 'FAILURE';
        }
      };

      const pvPollingCallback = updatedPlansPollingResponse => {
        if (updatedPlansPollingResponse && updatedPlansPollingResponse.isSuccessful === true) {
          return getPVs(updatedPlansPollingResponse, createPlanRes);
        }
      };
      const pvParams = {
        asyncFetch: fetchPlansGenerator,
        delay: PlanMigrationPollingInterval,
        callback: pvPollingCallback,
      };

      dispatch(PlanActions.startPVPolling(pvParams));

      /**
       * Create the plan object & start status polling
       */

      dispatch(PlanActions.planResultsRequest());

      const getPlanStatusCondition = (pollingResponse, newObjectRes) => {
        const matchingPlan = pollingResponse.updatedPlans.find(
          p => p.MigPlan.metadata.name === newObjectRes.data.metadata.name
        );

        const planStatus = matchingPlan ? planUtils.getPlanStatus(matchingPlan) : null;
        if (planStatus.success) {
          dispatch(PlanActions.updatePlanResults('Success'));
          dispatch(PlanActions.updatePlan(matchingPlan.MigPlan));
          return 'SUCCESS';
        } else if (planStatus.error) {
          dispatch(PlanActions.updatePlanResults('Failure'));
          dispatch(PlanActions.updatePlan(matchingPlan.MigPlan));
          return 'FAILURE';
        }
      };

      const statusParams = {
        asyncFetch: fetchPlansGenerator,
        delay: PlanMigrationPollingInterval,
        type: 'PLAN',
        callback: getPlanStatusCondition,
        statusItem: createPlanRes,
        dispatch,
      };

      dispatch(startStatusPolling(statusParams));

      dispatch(PlanActions.addPlanSuccess(createPlanRes.data));
    } catch (err) {
      dispatch(alertErrorTimeout('Failed to add plan'));
    }
  };
};

const removePlan = id => {
  throw new Error('NOT IMPLEMENTED');
};

const fetchPlans = () => {
  return async (dispatch, getState) => {
    dispatch(PlanActions.migPlanFetchRequest());
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const resource = new MigResource(MigResourceKind.MigPlan, migMeta.namespace);
      const res = await client.list(resource);
      const migPlans = res.data.items || [];

      const refs = await Promise.all(fetchMigMigrationsRefs(client, migMeta, migPlans));
      const groupedPlans = planUtils.groupPlans(migPlans, refs);
      dispatch(PlanActions.migPlanFetchSuccess(groupedPlans));
    } catch (err) {
      if (err.response) {
        dispatch(alertErrorTimeout(err.response.data.message));
      } else if (err.message) {
        dispatch(alertErrorTimeout(err.message));
      } else {
        dispatch(alertErrorTimeout('Failed to fetch plans: An unknown error occurred'));
      }
      dispatch(PlanActions.migPlanFetchFailure());
    }
  };
};
function fetchMigMigrationsRefs(client: IClusterClient, migMeta, migPlans): Array<Promise<any>> {
  const refs: Array<Promise<any>> = [];

  migPlans.forEach(plan => {
    const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);
    refs.push(client.list(migMigrationResource));
  });

  return refs;
}

const fetchNamespacesForCluster = clusterName => {
  return async (dispatch, getState) => {
    const client: IClusterClient = ClientFactory.forCluster(clusterName, getState());
    const nsResource = new CoreClusterResource(CoreClusterResourceKind.Namespace);
    try {
      dispatch(PlanActions.namespaceFetchRequest());
      const res = await client.list(nsResource);
      dispatch(PlanActions.namespaceFetchSuccess(res.data.items));
    } catch (err) {
      if (utils.isSelfSignedCertError(err)) {
        const failedUrl = `${client.apiRoot}${nsResource.listPath()}`;
        utils.handleSelfSignedCertError(failedUrl, dispatch);
        return;
      }
      dispatch(PlanActions.namespaceFetchFailure(err));
      dispatch(alertErrorTimeout('Failed to fetch namespaces'));
    }
  };
};

function* fetchPlansGenerator() {
  const state = yield select();
  const client: IClusterClient = ClientFactory.hostCluster(state);
  const resource = new MigResource(MigResourceKind.MigPlan, state.migMeta.namespace);
  try {
    let planList = yield client.list(resource);
    planList = yield planList.data.items;
    const refs = yield Promise.all(fetchMigMigrationsRefs(client, state.migMeta, planList));
    const groupedPlans = yield planUtils.groupPlans(planList, refs);
    return { updatedPlans: groupedPlans, isSuccessful: true };
  } catch (e) {
    return { e, isSuccessful: false };
  }
}

export default {
  pvFetchRequest,
  fetchPlans,
  addPlan,
  removePlan,
  fetchNamespacesForCluster,
  runStage,
  runMigration,
  fetchMigMigrationsRefs,
  fetchPlansGenerator,
};
