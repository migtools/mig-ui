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
import { commonOperations } from '../../common/duck';
import { isSelfSignedCertError, handleSelfSignedCertError } from '../../common/duck/utils';
import planUtils from './utils';
import { select } from 'redux-saga/effects';
import { startStatusPolling } from '../../common/duck/actions';

import planOperations from '../../cluster/duck/operations';
/* tslint:disable */
const uuidv1 = require('uuid/v1');
/* tslint:enable */
const migPlanFetchRequest = Creators.migPlanFetchRequest;
const migPlanFetchSuccess = Creators.migPlanFetchSuccess;
const migPlanFetchFailure = Creators.migPlanFetchFailure;
const pvFetchRequest = Creators.pvFetchRequest;
const pvFetchSuccess = Creators.pvFetchSuccess;
const migrationFailure = Creators.migrationFailure;
const stagingFailure = Creators.stagingFailure;
const planResultsRequest = Creators.planResultsRequest;
const addPlanRequest = Creators.addPlanRequest;
const addPlanSuccess = Creators.addPlanSuccess;
const addPlanFailure = Creators.addPlanFailure;
const sourceClusterNamespacesFetchSuccess = Creators.sourceClusterNamespacesFetchSuccess;

const runStage = plan => {
  return async (dispatch, getState) => {
    try {
      dispatch(Creators.initStage(plan.MigPlan.metadata.name));
      dispatch(commonOperations.alertProgressTimeout('Staging Started'));
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const migMigrationObj = createMigMigration(
        uuidv1(),
        plan.MigPlan.metadata.name,
        migMeta.namespace,
        true
      );
      const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);

      //created migration response object
      const createMigRes = await client.create(migMigrationResource, migMigrationObj);
      const migrationListResponse = await client.list(migMigrationResource);
      const groupedPlan = planUtils.groupPlan(plan, migrationListResponse);

      const params = {
        asyncFetch: fetchPlansGenerator,
        delay: 500,
        callback: commonOperations.getStatusCondition,
        type: 'STAGE',
        statusItem: createMigRes,
        dispatch: dispatch,
      };

      dispatch(startStatusPolling(params));
      dispatch(Creators.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
      dispatch(stagingFailure(err));
    }
  };
};

const runMigration = plan => {
  return async (dispatch, getState) => {
    try {
      dispatch(Creators.initMigration(plan.MigPlan.metadata.name));
      dispatch(commonOperations.alertProgressTimeout('Migration Started'));
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const migMigrationObj = createMigMigration(
        uuidv1(),
        plan.MigPlan.metadata.name,
        migMeta.namespace,
        false
      );
      const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);

      //created migration response object
      const createMigRes = await client.create(migMigrationResource, migMigrationObj);

      const migrationListResponse = await client.list(migMigrationResource);
      const groupedPlan = planUtils.groupPlan(plan, migrationListResponse);

      const params = {
        asyncFetch: fetchPlansGenerator,
        delay: 500,
        callback: commonOperations.getStatusCondition,
        type: 'MIGRATION',
        statusItem: createMigRes,
        dispatch: dispatch,
      };

      dispatch(startStatusPolling(params));
      dispatch(Creators.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
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

      const statusParams = {
        asyncFetch: fetchPlansGenerator,
        delay: 500,
        type: 'PLAN',
        callback: commonOperations.getStatusCondition,
        statusItem: createPlanRes,
        dispatch: dispatch,
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
        delay: 500,
        callback: pvPollingCallback,
      };

      dispatch(Creators.pvFetchRequest());
      dispatch(Creators.startPVPolling(pvParams));

      dispatch(addPlanSuccess(createPlanRes.data));
    } catch (err) {
      dispatch(addPlanFailure());
      dispatch(commonOperations.alertErrorTimeout('Failed to add plan'));
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
      dispatch(commonOperations.alertErrorTimeout(err));
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
        dispatch(commonOperations.alertErrorTimeout(err.response.data.message));
      } else if (err.message) {
        dispatch(commonOperations.alertErrorTimeout(err.message));
      } else {
        dispatch(
          commonOperations.alertErrorTimeout('Failed to fetch plans: An unknown error occurred')
        );
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
      if (isSelfSignedCertError(err)) {
        const failedUrl = `${client.apiRoot}${nsResource.listPath()}`;
        handleSelfSignedCertError(failedUrl, dispatch);
        return;
      }
      dispatch(commonOperations.alertErrorTimeout(err));
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
