import { ClusterActions } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';

import {
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
} from '../../../client/resources';
import { MigResource, MigResourceKind } from '../../../client/resources';
import {
  AlertActions
} from '../../common/duck/actions';
import { select, put } from 'redux-saga/effects';

const removeCluster = name => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const { migMeta } = state;
      const client: IClusterClient = ClientFactory.cluster(state);

      const secretResource = new CoreNamespacedResource(
        CoreNamespacedResourceKind.Secret,
        migMeta.configNamespace
      );
      const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);

      await Promise.all([
        client.delete(secretResource, name),
        client.delete(migClusterResource, name),
      ]);

      dispatch(ClusterActions.removeClusterSuccess(name));
      dispatch(AlertActions.alertSuccessTimeout(`Successfully removed cluster "${name}"!`));
    } catch (err) {
      dispatch(AlertActions.alertErrorTimeout(err));
      dispatch(ClusterActions.removeClusterFailure(err));
    }
  };
};

function fetchMigClusterRefs(client: IClusterClient, migMeta, migClusters): Array<Promise<any>> {
  const refs: Array<Promise<any>> = [];

  migClusters.forEach(cluster => {
    const secretRef = cluster.spec.serviceAccountSecretRef;
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      secretRef.namespace
    );
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
      fullCluster['Secret'] = refs.find(
        i => i.data.kind === 'Secret' && i.data.metadata.name === mc.spec.serviceAccountSecretRef.name
      ).data;
    }

    return fullCluster;
  });
}

function* fetchClustersGenerator() {
  const state = yield select();
  const client: IClusterClient = ClientFactory.cluster(state);
  const resource = new MigResource(MigResourceKind.MigCluster, state.migMeta.namespace);
  try {
    let clusterList = yield client.list(resource);
    clusterList = yield clusterList.data.items;
    const nonHostClusters = clusterList.filter(c => !c.spec.isHostCluster);
    const refs = yield Promise.all(fetchMigClusterRefs(client, state.migMeta, nonHostClusters));
    const groupedClusters = groupClusters(clusterList, refs);
    return { updatedClusters: groupedClusters, isSuccessful: true };
  } catch (e) {
    put(AlertActions.alertErrorTimeout('Failed to fetch clusters. '));

    return { e, isSuccessful: false };
  }
}

export default {
  fetchClustersGenerator,
  removeCluster,
};
