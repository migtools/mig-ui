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
  createClusterRegistryObj,
  createTokenSecret,
  createMigCluster,
} from '../../../client/resources/conversions';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { commonOperations } from '../../common/duck';

const clusterFetchSuccess = Creators.clusterFetchSuccess;
const clusterFetchRequest = Creators.clusterFetchRequest;
const clusterFetchFailure = Creators.clusterFetchFailure;
const addClusterSuccess = Creators.addClusterSuccess;
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
      cluster.status = clusterValues.connectionStatus;
      dispatch(addClusterSuccess(cluster));
      dispatch(commonOperations.alertSuccessTimeout('Successfully added cluster'));
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
        client.patch(clusterRegResource, clusterValues.name, clusterReg),
        client.patch(secretResource, clusterValues.name, tokenSecret),
        client.patch(migClusterResource, clusterValues.name, migCluster),
      ]);
      const cluster = arr.reduce((accum, res) => {
        accum[res.data.kind] = res.data;
        return accum;
      }, {});
      cluster.status = clusterValues.connectionStatus;
      dispatch(updateClusterSuccess(cluster));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};

const removeCluster = id => {
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
        client.delete(clusterRegResource, id),
        client.delete(secretResource, id),
        client.delete(migClusterResource, id),
      ]);

      // TODO:  Unsure if both dispatches below are needed.
      //        Do we want the removeClusterSuccess(id)
      //        or is dispatch(fetchClusters()) sufficient?
      //
      dispatch(removeClusterSuccess(id));
      dispatch(fetchClusters());
    } catch (err) {
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
      dispatch(
        commonOperations.alertErrorTimeout(err.response.data.message || 'Failed to fetch clusters')
      );
      dispatch(clusterFetchFailure());
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
export default {
  fetchClusters,
  addCluster,
  removeCluster,
  updateCluster,
  updateSearchTerm,
  checkConnection,
};
