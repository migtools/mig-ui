import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import ConnectionState from '../../common/connection_state';

import {
  ClusterRegistryResource,
  ClusterRegistryResourceKind,
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
} from '../../../client/resources';
import {
  updateClusterRegistryObj,
  updateTokenSecret,
} from '../../../client/resources/conversions';
import { MigResource, MigResourceKind } from '../../../client/resources';
import {
  alertSuccessTimeout,
  alertErrorTimeout,
} from '../../common/duck/actions';
import { select } from 'redux-saga/effects';

const clusterFetchSuccess = Creators.clusterFetchSuccess;
const clusterFetchRequest = Creators.clusterFetchRequest;
const clusterFetchFailure = Creators.clusterFetchFailure;
const updateClusterSuccess = Creators.updateClusterSuccess;
const removeClusterSuccess = Creators.removeClusterSuccess;
const removeClusterFailure = Creators.removeClusterFailure;
const updateSearchTerm = Creators.updateSearchTerm;

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
      dispatch(alertSuccessTimeout(`Successfully updated cluster "${clusterValues.name}"!`));
    } catch (err) {
      dispatch(alertErrorTimeout(err));
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
      dispatch(alertSuccessTimeout(`Successfully removed cluster "${name}"!`));
    } catch (err) {
      dispatch(alertErrorTimeout(err));
      dispatch(removeClusterFailure(err));
    }
  };
};

function checkConnection() {
  return (dispatch, getState) => {
    dispatch(Creators.setConnectionState(ConnectionState.Checking));
    setTimeout(() => {
      dispatch(Creators.setConnectionState(ConnectionState.Success));
    }, 500);
  };
}

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
  removeCluster,
  updateCluster,
  updateSearchTerm,
  checkConnection,
};
