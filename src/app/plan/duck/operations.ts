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
const addPlanSuccess = Creators.addPlanSuccess;

// const addPlanFailure = Creators.addPlanFailure;
// const removePlanSuccess = Creators.removePlanSuccess;
// const removePlanFailure = Creators.removePlanFailure;
const sourceClusterNamespacesFetchSuccess = Creators.sourceClusterNamespacesFetchSuccess;

const PollingInterval = 5000;
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
          const sortMigrations = migrationList =>
            migrationList.sort(function(left, right) {
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
    fullPlan['planState'] = {
      migrations: [],
      persistentVolumes: [],
      status: {
        state: 'Not Started',
        progress: 0,
      },
    };
    if (refs[0].data.items.length > 0) {
      const matchingMigrations = refs[0].data.items.filter(
        i => i.kind === 'MigMigration' && i.spec.migPlanRef.name === mp.metadata.name
      );
      const getStatus = () => {
        if (matchingMigrations.length > 0 && matchingMigrations[0].status) {
          return matchingMigrations[0].status.conditions[0].message;
        } else {
          return 'Not Started';
        }
      };
      fullPlan['planState'] = {
        migrations: [],
        persistentVolumes: [],
        status: {
          state: 'Not Started',
          status: getStatus(),
          progress: 0,
        },
      };

      fullPlan['Migrations'] = matchingMigrations;
    } else {
      fullPlan['Migrations'] = [];
    }
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
    console.log('error polling', e);
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
