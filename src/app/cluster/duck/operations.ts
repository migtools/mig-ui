import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';

import {
  ClusterRegistryResource,
  ClusterRegistryResourceKind,
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
} from '../../../client/resources';
import {
  createClusterRegistryObj,
  createTokenSecret,
  createMigCluster,
  updateClusterRegistryObj,
  updateTokenSecret,
} from '../../../client/resources/conversions';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { commonOperations } from '../../common/duck';
import { select } from 'redux-saga/effects';
import { startStatusPolling } from '../../common/duck/actions';

const clusterFetchSuccess = Creators.clusterFetchSuccess;
const clusterFetchRequest = Creators.clusterFetchRequest;
const clusterFetchFailure = Creators.clusterFetchFailure;
const addClusterRequest = Creators.addClusterRequest;
const updateClusterSuccess = Creators.updateClusterSuccess;
const removeClusterSuccess = Creators.removeClusterSuccess;
const removeClusterFailure = Creators.removeClusterFailure;
const updateSearchTerm = Creators.updateSearchTerm;

const addCluster = clusterValues => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const { migMeta } = state;
      const client: IClusterClient = ClientFactory.hostCluster(state);

      const clusterReg = createClusterRegistryObj(
        clusterValues.name,
        migMeta.namespace,
        clusterValues.url
      );
      const tokenSecret = createTokenSecret(
        clusterValues.name,
        migMeta.configNamespace,
        clusterValues.token
      );
      const migCluster = createMigCluster(
        clusterValues.name,
        migMeta.namespace,
        clusterReg,
        tokenSecret
      );

      const clusterRegResource = new ClusterRegistryResource(
        ClusterRegistryResourceKind.Cluster,
        migMeta.namespace
      );
      const secretResource = new CoreNamespacedResource(
        CoreNamespacedResourceKind.Secret,
        migMeta.configNamespace
      );
      const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);

      const arr = await Promise.all([
        client.create(clusterRegResource, clusterReg),
        client.create(secretResource, tokenSecret),
        client.create(migClusterResource, migCluster),
      ]);
      const cluster = arr.reduce((accum, res) => {
        accum[res.data.kind] = res.data;
        return accum;
      }, {});

      //status polling logic
      const statusParams = {
        asyncFetch: fetchClustersGenerator,
        delay: 500,
        type: 'CLUSTER',
        callback: commonOperations.getStatusCondition,
        statusItem: cluster,
        dispatch: dispatch,
      };
      dispatch(addClusterRequest());
      dispatch(startStatusPolling(statusParams));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
    }
  };
};

const updateCluster = clusterValues => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const { migMeta } = state;
      const client: IClusterClient = ClientFactory.hostCluster(state);

      const clusterReg = updateClusterRegistryObj(clusterValues.url);
      const tokenSecret = updateTokenSecret(clusterValues.token);
      const clusterRegResource = new ClusterRegistryResource(
        ClusterRegistryResourceKind.Cluster,
        migMeta.namespace
      );
      const secretResource = new CoreNamespacedResource(
        CoreNamespacedResourceKind.Secret,
        migMeta.configNamespace
      );

      const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);

      const arr = await Promise.all([
        client.patch(clusterRegResource, clusterValues.name, clusterReg),
        client.patch(secretResource, clusterValues.name, tokenSecret),
        client.get(migClusterResource, clusterValues.name),
      ]);
      const cluster = arr.reduce((accum, res) => {
        accum[res.data.kind] = res.data;
        return accum;
      }, {});
      cluster.status = clusterValues.connectionStatus;

      dispatch(updateClusterSuccess(cluster));
      dispatch(
        commonOperations.alertSuccessTimeout(
          `Successfully updated cluster "${clusterValues.name}"!`
        )
      );
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
    }
  };
};

const removeCluster = name => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const { migMeta } = state;
      const client: IClusterClient = ClientFactory.hostCluster(state);

      const clusterRegResource = new ClusterRegistryResource(
        ClusterRegistryResourceKind.Cluster,
        migMeta.namespace
      );
      const secretResource = new CoreNamespacedResource(
        CoreNamespacedResourceKind.Secret,
        migMeta.configNamespace
      );
      const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);

      const arr = await Promise.all([
        client.delete(clusterRegResource, name),
        client.delete(secretResource, name),
        client.delete(migClusterResource, name),
      ]);

      dispatch(removeClusterSuccess(name));
      dispatch(commonOperations.alertSuccessTimeout(`Successfully removed cluster "${name}"!`));
    } catch (err) {
      dispatch(commonOperations.alertErrorTimeout(err));
      dispatch(removeClusterFailure(err));
    }
  };
};

const fetchClusters = () => {
  return async (dispatch, getState) => {
    dispatch(clusterFetchRequest());
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const resource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);

      const res = await client.list(resource);
      const migClusters = res.data.items;
      const nonHostClusters = migClusters.filter(c => !c.spec.isHostCluster);
      const refs = await Promise.all(fetchMigClusterRefs(client, migMeta, nonHostClusters));
      const groupedClusters = groupClusters(migClusters, refs);
      dispatch(clusterFetchSuccess(groupedClusters));
    } catch (err) {
      if (err.response) {
        dispatch(commonOperations.alertErrorTimeout(err.response.data.message));
      } else if (err.message) {
        dispatch(commonOperations.alertErrorTimeout(err.message));
      } else {
        dispatch(
          commonOperations.alertErrorTimeout('Failed to fetch clusters: An unknown error occurred')
        );
      }
      dispatch(clusterFetchFailure());
    }
  };
};

function fetchMigClusterRefs(client: IClusterClient, migMeta, migClusters): Array<Promise<any>> {
  const refs: Array<Promise<any>> = [];

  migClusters.forEach(cluster => {
    const clusterRef = cluster.spec.clusterRef;
    const secretRef = cluster.spec.serviceAccountSecretRef;
    const clusterRegResource = new ClusterRegistryResource(
      ClusterRegistryResourceKind.Cluster,
      clusterRef.namespace
    );
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      secretRef.namespace
    );
    refs.push(client.get(clusterRegResource, clusterRef.name));
    refs.push(client.get(secretResource, secretRef.name));
  });

  return refs;
}

function groupClusters(migClusters: any[], refs: any[]): any[] {
  return migClusters.map(mc => {
    const fullCluster = {
      MigCluster: mc,
    };

    if (!mc.spec.isHostCluster) {
      fullCluster['Cluster'] = refs.find(
        i => i.data.kind === 'Cluster' && i.data.metadata.name === mc.metadata.name
      ).data;
      fullCluster['Secret'] = refs.find(
        i => i.data.kind === 'Secret' && i.data.metadata.name === mc.metadata.name
      ).data;
    }

    return fullCluster;
  });
}

function* fetchClustersGenerator() {
  const state = yield select();
  const client: IClusterClient = ClientFactory.hostCluster(state);
  const resource = new MigResource(MigResourceKind.MigCluster, state.migMeta.namespace);
  try {
    let clusterList = yield client.list(resource);
    clusterList = yield clusterList.data.items;
    const nonHostClusters = clusterList.filter(c => !c.spec.isHostCluster);
    const refs = yield Promise.all(fetchMigClusterRefs(client, state.migMeta, nonHostClusters));
    const groupedClusters = groupClusters(clusterList, refs);
    return { updatedClusters: groupedClusters, isSuccessful: true };
  } catch (e) {
    return { e, isSuccessful: false };
  }
}

export default {
  fetchClustersGenerator,
  fetchClusters,
  addCluster,
  removeCluster,
  updateCluster,
  updateSearchTerm,
};
