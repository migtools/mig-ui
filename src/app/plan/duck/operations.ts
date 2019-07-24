import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { CoreClusterResource, CoreClusterResourceKind } from '../../../client/resources';

import {
  createMigMigration,
  createMigPlanNoStorage,
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
const migPlanFetchRequest = Creators.migPlanFetchRequest;
const migPlanFetchSuccess = Creators.migPlanFetchSuccess;
const migPlanFetchFailure = Creators.migPlanFetchFailure;
const pvFetchRequest = Creators.pvFetchRequest;
const pvFetchSuccess = Creators.pvFetchSuccess;
const migrationSuccess = Creators.migrationSuccess;
const migrationFailure = Creators.migrationFailure;
const stagingSuccess = Creators.stagingSuccess;
const stagingFailure = Creators.stagingFailure;
const planResultsRequest = Creators.planResultsRequest;
const addPlanRequest = Creators.addPlanRequest;
const addPlanSuccess = Creators.addPlanSuccess;
const addPlanFailure = Creators.addPlanFailure;
const sourceClusterNamespacesFetchSuccess = Creators.sourceClusterNamespacesFetchSuccess;
const updatePlanResults = Creators.updatePlanResults;
const updatePlan = Creators.updatePlan;

const PlanMigrationPollingInterval = 1000;

const runStage = plan => {
  return async (dispatch, getState) => {
    try {
      dispatch(Creators.initStage(plan.MigPlan.metadata.name));
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
          dispatch(stagingSuccess(newObjectRes.data.spec.migPlanRef.name));
          dispatch(alertSuccessTimeout('Staging Successful'));
          return 'SUCCESS';
        } else if (migStatus.error) {
          dispatch(stagingFailure());
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
      dispatch(Creators.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(alertErrorTimeout(err));
      dispatch(stagingFailure(err));
    }
  };
};

const runMigration = (plan, disableQuiesce) => {
  return async (dispatch, getState) => {
    try {
      dispatch(Creators.initMigration(plan.MigPlan.metadata.name));
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
          dispatch(migrationSuccess(newObjectRes.data.spec.migPlanRef.name));
          dispatch(alertSuccessTimeout('Migration Successful'));
          return 'SUCCESS';
        } else if (migStatus.error) {
          dispatch(migrationFailure());
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
      dispatch(Creators.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(alertErrorTimeout(err));
      dispatch(migrationFailure(err));
    }
  };
};

const addPlan = migPlan => {
  return async (dispatch, getState) => {
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const migPlanObj = createMigPlanNoStorage(
        migPlan.planName,
        migMeta.namespace,
        migPlan.sourceCluster,
        migPlan.targetCluster,
        migPlan.namespaces
      );

      const createPlanRes = await client.create(
        new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
        migPlanObj
      );
      const getPlanStatusCondition = (pollingResponse, newObjectRes) => {
        const matchingPlan = pollingResponse.updatedPlans.find(
          p => p.MigPlan.metadata.name === newObjectRes.data.metadata.name
        );

        const planStatus = matchingPlan ? planUtils.getPlanStatus(matchingPlan) : null;
        if (planStatus.success) {
          dispatch(updatePlanResults('Success'));
          dispatch(updatePlan(matchingPlan.MigPlan));

          return 'SUCCESS';
        } else if (planStatus.error) {
          dispatch(updatePlanResults('Failure'));
          dispatch(updatePlan(matchingPlan.MigPlan));
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

      dispatch(planResultsRequest());
      dispatch(startStatusPolling(statusParams));

      const pvPollingCallback = updatedPlansPollingResponse => {
        if (updatedPlansPollingResponse && updatedPlansPollingResponse.isSuccessful === true) {
          return getPVs(dispatch, updatedPlansPollingResponse, createPlanRes);
        }
      };

      const pvParams = {
        asyncFetch: fetchPlansGenerator,
        delay: PlanMigrationPollingInterval,
        callback: pvPollingCallback,
      };

      dispatch(Creators.pvFetchRequest());
      dispatch(Creators.startPVPolling(pvParams));

      dispatch(addPlanSuccess(createPlanRes.data));
    } catch (err) {
      console.error(err);
      dispatch(addPlanFailure());
      dispatch(alertErrorTimeout('Failed to add plan'));
    }
  };
};

const putPlan = planValues => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const migMeta = state.migMeta;
      const client: IClusterClient = ClientFactory.hostCluster(state);

      // When updating objects
      const latestPlanRes = await client.get(
        new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
        planValues.planName
      );
      const latestPlan = latestPlanRes.data;

      dispatch(Creators.updatePlan(latestPlan));
      const updatedMigPlan = updateMigPlanFromValues(latestPlan, planValues);

      const putRes = await client.put(
        new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
        latestPlan.metadata.name,
        updatedMigPlan
      );
      // TODO: Need some kind of retry logic here in case the resourceVersion
      // gets ticked up in between us getting and putting the mutated object back
      dispatch(Creators.updatePlan(putRes.data));
    } catch (err) {
      dispatch(alertErrorTimeout(err));
    }
  };
};

const removePlan = id => {
  throw new Error('NOT IMPLEMENTED');
};

const fetchPlans = () => {
  return async (dispatch, getState) => {
    dispatch(migPlanFetchRequest());
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const resource = new MigResource(MigResourceKind.MigPlan, migMeta.namespace);
      const res = await client.list(resource);
      const migPlans = res.data.items || [];

      const refs = await Promise.all(fetchMigMigrationsRefs(client, migMeta, migPlans));
      const groupedPlans = planUtils.groupPlans(migPlans, refs);
      dispatch(migPlanFetchSuccess(groupedPlans));
    } catch (err) {
      if (err.response) {
        dispatch(alertErrorTimeout(err.response.data.message));
      } else if (err.message) {
        dispatch(alertErrorTimeout(err.message));
      } else {
        dispatch(alertErrorTimeout('Failed to fetch plans: An unknown error occurred'));
      }
      dispatch(migPlanFetchFailure());
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
      const res = await client.list(nsResource);
      dispatch(sourceClusterNamespacesFetchSuccess(res.data.items));
    } catch (err) {
      if (utils.isSelfSignedCertError(err)) {
        const failedUrl = `${client.apiRoot}${nsResource.listPath()}`;
        utils.handleSelfSignedCertError(failedUrl, dispatch);
        return;
      }
      dispatch(alertErrorTimeout(err));
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
const getPVs = (dispatch, updatedPlansPollingResponse, newObjectRes) => {
  const matchingPlan = updatedPlansPollingResponse.updatedPlans.find(
    p => p.MigPlan.metadata.name === newObjectRes.data.metadata.name
  );

  const pvSearchStatus = matchingPlan ? planUtils.getPlanPVs(matchingPlan) : null;
  if (pvSearchStatus.success) {
    dispatch(Creators.updatePlan(matchingPlan.MigPlan));
    dispatch(pvFetchSuccess());
    return 'SUCCESS';
  } else if (pvSearchStatus.error) {
    return 'FAILURE';
  }
};

export default {
  pvFetchRequest,
  fetchPlans,
  addPlan,
  putPlan,
  removePlan,
  fetchNamespacesForCluster,
  runStage,
  runMigration,
  fetchMigMigrationsRefs,
  fetchPlansGenerator,
};
