import { PlanActions } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';

import {
  createMigMigration,
  createInitialMigPlan,
} from '../../../client/resources/conversions';
import {
  AlertActions
} from '../../common/duck/actions';
import planUtils from './utils';
import { select } from 'redux-saga/effects';
import { PollingActions } from '../../common/duck/actions';
import { IDiscoveryClient } from '../../../client/discoveryClient';
import { NamespaceDiscovery } from '../../../client/resources/discovery';
import { DiscoveryResource } from '../../../client/resources/common';
import utils from '../../common/duck/utils';

/* eslint:disable */
const uuidv1 = require('uuid/v1');
/* eslint:enable */
const PlanMigrationPollingInterval = 5000;

const runStage = plan => {
  return async (dispatch, getState) => {
    try {
      dispatch(PlanActions.initStage(plan.MigPlan.metadata.name));
      dispatch(AlertActions.alertProgressTimeout('Staging Started'));
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.cluster(getState());
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
          dispatch(AlertActions.alertSuccessTimeout('Staging Successful'));
          return 'SUCCESS';
        } else if (migStatus.error) {
          dispatch(PlanActions.stagingFailure(migStatus.error));
          dispatch(AlertActions.alertErrorTimeout('Staging Failed'));
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

      dispatch(PollingActions.startStatusPolling(params));
      dispatch(PlanActions.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(AlertActions.alertErrorTimeout(err));
      dispatch(PlanActions.stagingFailure(err));
    }
  };
};

const runMigration = (plan, disableQuiesce) => {
  return async (dispatch, getState) => {
    try {
      dispatch(PlanActions.initMigration(plan.MigPlan.metadata.name));
      dispatch(AlertActions.alertProgressTimeout('Migration Started'));
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.cluster(getState());

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
          dispatch(PlanActions.planCloseRequest(newObjectRes.data.spec.migPlanRef.name));
          dispatch(AlertActions.alertSuccessTimeout('Migration Successful'));
          return 'SUCCESS';
        } else if (migStatus.error) {
          dispatch(PlanActions.migrationFailure(migStatus.error));
          dispatch(AlertActions.alertErrorTimeout('Migration Failed'));
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

      dispatch(PollingActions.startStatusPolling(params));
      dispatch(PlanActions.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(AlertActions.alertErrorTimeout(err));
      dispatch(PlanActions.migrationFailure(err));
    }
  };
};

const addPlan = (migPlan) => {
  return async (dispatch, getState) => {
    try {
      /**
       * Create the plan object. Blocks all code in this function until createPlanRes
       */
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.cluster(getState());

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

      dispatch(PlanActions.setCurrentPlan(createPlanRes.data));
      dispatch(PlanActions.addPlanSuccess(createPlanRes.data));

    } catch (err) {
      dispatch(AlertActions.alertErrorTimeout('Failed to add plan'));
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
      const client: IClusterClient = ClientFactory.cluster(getState());
      const resource = new MigResource(MigResourceKind.MigPlan, migMeta.namespace);
      const res = await client.list(resource);
      const migPlans = res.data.items || [];

      const refs = await Promise.all(fetchMigMigrationsRefs(client, migMeta, migPlans));
      const groupedPlans = planUtils.groupPlans(migPlans, refs);
      dispatch(PlanActions.migPlanFetchSuccess(groupedPlans));
    } catch (err) {
      if (err.response) {
        dispatch(AlertActions.alertErrorTimeout(err.response.data.message));
      } else if (err.message) {
        dispatch(AlertActions.alertErrorTimeout(err.message));
      } else {
        dispatch(AlertActions.alertErrorTimeout('Failed to fetch plans: An unknown error occurred'));
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
    const state = getState();
    const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
    const namespaces: DiscoveryResource = new NamespaceDiscovery(clusterName);
    try {
      dispatch(PlanActions.namespaceFetchRequest());
      const res = await discoveryClient.get(namespaces);
      const namespaceNames = res.data.map(namespaceName => ({
        name: namespaceName
      }));
      dispatch(PlanActions.namespaceFetchSuccess(namespaceNames));
    } catch (err) {
      if (utils.isTimeoutError(err)) {
        dispatch(AlertActions.alertErrorTimeout('Timed out while fetching namespaces'));
      } else if (utils.isSelfSignedCertError(err)) {
        const failedUrl = `${discoveryClient.apiRoot()}/${namespaces.path()}`;
        utils.handleSelfSignedCertError(failedUrl, dispatch);
        return;
      }
      dispatch(PlanActions.namespaceFetchFailure(err));
      dispatch(AlertActions.alertErrorTimeout('Failed to fetch namespaces'));
    }
  };
};

function* fetchPlansGenerator() {
  const state = yield select();
  const client: IClusterClient = ClientFactory.cluster(state);
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
  fetchPlans,
  addPlan,
  removePlan,
  fetchNamespacesForCluster,
  runStage,
  runMigration,
  fetchMigMigrationsRefs,
  fetchPlansGenerator,
};
