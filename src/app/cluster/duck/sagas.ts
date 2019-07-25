import { takeLatest, select, race, call, put, } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
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

import { Creators } from './actions';
import { alertSuccessTimeout, alertErrorTimeout } from '../../common/duck/actions';

function* addClusterRequest(action)  {
  // TODO: Need to improve this to fall into the failed create state with rollback
  const state = yield select();
  const { migMeta } = state;
  const { clusterValues } = action;
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

  try {
    const clusterAddResults = yield Promise.all([
      client.create(clusterRegResource, clusterReg),
      client.create(secretResource, tokenSecret),
      client.create(migClusterResource, migCluster),
    ]);

    const cluster = clusterAddResults.reduce((accum, res) => {
      accum[res.data.kind] = res.data;
      return accum;
    }, {});

    put(Creators.addClusterSuccess(cluster));
    put(alertSuccessTimeout('Successfully added cluster'));
  } catch(err) {
    // TODO: Creation failed, should enter failed creation state here
    // Also need to rollback the objects that were successfully created.
    // Could use Promise.allSettled here as well.
    console.error('Cluster failed creation with error: ', err)
    put(alertErrorTimeout('Cluster failed creation'));
  }
}

function* watchAddClusterRequest() {
  yield takeLatest(Creators.addClusterRequest().type, addClusterRequest);
}

export default {
  watchAddClusterRequest,
};
