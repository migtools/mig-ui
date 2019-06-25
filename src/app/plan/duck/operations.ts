import moment from 'moment';
import { select } from 'redux-saga/effects';
import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import {
  CoreClusterResource,
  CoreClusterResourceKind,
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
} from '../../../client/resources';

import {
  createMigPlan,
  createMigMigration,
  createMigPlanNoStorage,
  updateMigPlanFromValues,
} from '../../../client/resources/conversions';
import { commonOperations } from '../../common/duck';
import { isSelfSignedCertError, handleSelfSignedCertError } from '../../common/duck/utils';

/* tslint:disable */
const uuidv1 = require('uuid/v1');
/* tslint:enable */
const migPlanFetchRequest = Creators.migPlanFetchRequest;
const migPlanFetchSuccess = Creators.migPlanFetchSuccess;
const migPlanFetchFailure = Creators.migPlanFetchFailure;
const pvFetchRequest = Creators.pvFetchRequest;
const pvFetchFailure = Creators.pvFetchFailure;
const pvFetchSuccess = Creators.pvFetchSuccess;
const migrationSuccess = Creators.migrationSuccess;
const stagingSuccess = Creators.stagingSuccess;
const addPlanSuccess = Creators.addPlanSuccess;
const sourceClusterNamespacesFetchSuccess = Creators.sourceClusterNamespacesFetchSuccess;

const PollingInterval = 5000;
const PvsDiscoveredType = 'PvsDiscovered';

const groupPlan: any = (plan, response) => {
  const fullPlan = {
    MigPlan: plan.MigPlan,
  };
  if (response.data.items.length > 0) {
    const sortMigrations = migrationList =>
      migrationList.sort((left, right) => {
        return moment
          .utc(right.metadata.creationTimestamp)
          .diff(moment.utc(left.metadata.creationTimestamp));
      });

    const matchingMigrations = response.data.items.filter(
      i => i.kind === 'MigMigration' && i.spec.migPlanRef.name === plan.MigPlan.metadata.name
    );

    fullPlan['Migrations'] = sortMigrations(matchingMigrations);
  } else {
    fullPlan['Migrations'] = [];
  }
  return fullPlan;
};

const runStage = plan => {
  return async (dispatch, getState) => {
    try {
      dispatch(Creators.initStage(plan.MigPlan.metadata.name));
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
      const groupedPlan = groupPlan(plan, migrationListResponse);

      dispatch(stagingSuccess(createMigRes.MigMigration.spec.migPlanRef.name));
      dispatch(Creators.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
    }
  };
};

const runMigration = plan => {
  return async (dispatch, getState) => {
    try {
      dispatch(Creators.initMigration(plan.MigPlan.metadata.name));
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
      const groupedPlan = groupPlan(plan, migrationListResponse);

      dispatch(migrationSuccess(createMigRes.MigMigration.spec.migPlanRef.name));
      dispatch(Creators.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
    }
  };
};

const addPlan = migPlan => {
  return async (dispatch, getState) => {
    try {
      dispatch(pvFetchRequest());
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const migPlanObj = createMigPlanNoStorage(
        migPlan.planName,
        migMeta.namespace,
        migPlan.sourceCluster,
        migPlan.targetCluster,
        migPlan.namespaces
      );

      const createRes = await client.create(
        new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
        migPlanObj
      );

      dispatch(addPlanSuccess(createRes.data));

      let timesRun = 0;
      const interval = setInterval(async () => {
        timesRun += 1;
        // TODO: replace timesRun with poller class
        if (timesRun === 12) {
          clearInterval(interval);
          dispatch(commonOperations.alertErrorTimeout('No PVs found'));
          dispatch(pvFetchFailure());
        }

        const planName = migPlan.planName;

        const getRes = await client.get(
          new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
          planName
        );

        const plan = getRes.data;
        if (plan.status) {
          const pvsDiscovered = !!plan.status.conditions.find(c => {
            return c.type === PvsDiscoveredType;
          });

          if (pvsDiscovered) {
            dispatch(Creators.updatePlan(plan));
            dispatch(pvFetchSuccess());
            dispatch(commonOperations.alertSuccessTimeout('Found PVs!'));
            console.debug('Discovered PVs, clearing interaval.');
            clearInterval(interval);
          }
        }
      }, PollingInterval);
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err.toString()));
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
      const groupedPlans = groupPlans(migPlans, refs);
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

function groupPlans(migPlans: any[], refs: any[]): any[] {
  return migPlans.map(mp => {
    const fullPlan = {
      MigPlan: mp,
    };
    if (refs[0].data.items.length > 0) {
      const matchingMigrations = refs[0].data.items.filter(
        i => i.kind === 'MigMigration' && i.spec.migPlanRef.name === mp.metadata.name
      );
      fullPlan['Migrations'] = matchingMigrations;
    } else {
      fullPlan['Migrations'] = [];
    }
    return fullPlan;
  });
}

const fetchNamespacesForCluster = clusterName => {
  return async (dispatch, getState) => {
    const client: IClusterClient = ClientFactory.forCluster(clusterName, getState());
    const nsResource = new CoreClusterResource(CoreClusterResourceKind.Namespace);
    try {
      const res = await client.list(nsResource);
      dispatch(sourceClusterNamespacesFetchSuccess(res.data.items));
    } catch(err) {
      if(isSelfSignedCertError(err)) {
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
    const groupedPlans = yield groupPlans(planList, refs);
    return { updatedPlans: groupedPlans, isSuccessful: true };
  } catch (e) {
    return { e, isSuccessful: false };
  }
}

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
