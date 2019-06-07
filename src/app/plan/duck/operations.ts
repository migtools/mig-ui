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

/* tslint:disable */
const uuidv1 = require('uuid/v1');
/* tslint:enable */
const migPlanFetchRequest = Creators.migPlanFetchRequest;
const migPlanFetchSuccess = Creators.migPlanFetchSuccess;
const migPlanFetchFailure = Creators.migPlanFetchFailure;
const pvFetchFailure = Creators.pvFetchFailure;
const migrationSuccess = Creators.migrationSuccess;
const addPlanSuccess = Creators.addPlanSuccess;

// const addPlanFailure = Creators.addPlanFailure;
// const removePlanSuccess = Creators.removePlanSuccess;
// const removePlanFailure = Creators.removePlanFailure;
const sourceClusterNamespacesFetchSuccess = Creators.sourceClusterNamespacesFetchSuccess;

const PollingInterval = 3000;
const PvsDiscoveredType = 'PvsDiscovered';

const runStage = plan => {
  return (dispatch, getState) => {
    dispatch(Creators.initStage(plan.planName));
    const planNameToStage = plan.planName;
    const interval = setInterval(() => {
      const planList = getState().plan.migPlanList;

      const planItem = planList.find(p => p.planName === planNameToStage);
      if (planItem.status.progress === 100) {
        dispatch(Creators.stagingSuccess(planItem.planName));
        clearInterval(interval);
        return;
      }

      const nextProgress = plan.status.progress + 10;
      dispatch(Creators.updatePlanProgress(plan.planName, nextProgress));
    }, 1000);
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
        migMeta.namespace
      );
      const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);

      const arr = await Promise.all([client.create(migMigrationResource, migMigrationObj)]);
      const migration = arr.reduce((accum, res) => {
        accum[res.data.kind] = res.data;
        return accum;
      }, {});
      const groupPlan = response => {
        const fullPlan = {
          MigPlan: plan.MigPlan,
        };
        if (response.data.items.length > 0) {
          fullPlan['Migrations'] = response.data.items.filter(
            i => i.kind === 'MigMigration' && i.spec.migPlanRef.name === plan.MigPlan.metadata.name
          );
        } else {
          fullPlan['Migrations'] = [];
        }
        fullPlan['planState'] = {
          migrations: [],
          persistentVolumes: [],
          status: {
            state: 'Not Started',
            progress: 0,
          },
        };
        return fullPlan;
      };
      const migrationListResponse = await client.list(migMigrationResource);
      const groupedPlan = groupPlan(migrationListResponse);

      dispatch(migrationSuccess(migration.MigMigration.spec.migPlanRef.name));
      dispatch(Creators.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
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

      const createRes = await client.create(
        new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
        migPlanObj
      );

      dispatch(addPlanSuccess(createRes.data));

      let timesRun = 0;
      const interval = setInterval(async () => {
        timesRun += 1;
        // TODO: replace timesRun with poller class
        if (timesRun === 3) {
          clearInterval(interval);
          dispatch(commonOperations.alertErrorTimeout('No PVs found'));
          dispatch(pvFetchFailure());
          // TODO: this is where we would trigger a validation check for this wizard step
          // & update the wizard next enable value.
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
            console.debug('Discovered PVs, clearing interaval.');
            clearInterval(interval);
          }
        }

        dispatch(Creators.updatePlan(plan));
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
      dispatch(commonOperations.alertErrorTimeout('Failed to fetch plans'));
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
      fullPlan['Migrations'] = refs[0].data.items.filter(
        i => i.kind === 'MigMigration' && i.spec.migPlanRef.name === mp.metadata.name
      );
    } else {
      fullPlan['Migrations'] = [];
    }
    fullPlan['planState'] = {
      migrations: [],
      persistentVolumes: [],
      status: {
        state: 'Not Started',
        progress: 0,
      },
    };
    return fullPlan;
  });
}

const fetchNamespacesForCluster = clusterName => {
  return (dispatch, getState) => {
    const client: IClusterClient = ClientFactory.forCluster(clusterName, getState());
    const nsResource = new CoreClusterResource(CoreClusterResourceKind.Namespace);
    client
      .list(nsResource)
      .then(res => {
        dispatch(sourceClusterNamespacesFetchSuccess(res.data.items));
      })
      .catch(err => commonOperations.alertErrorTimeout('Failed to load namespaces for cluster'));
  };
};

export default {
  fetchPlans,
  addPlan,
  putPlan,
  removePlan,
  fetchNamespacesForCluster,
  runStage,
  runMigration,
};
