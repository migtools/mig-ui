import { takeLatest, select} from 'redux-saga/effects';
import { ClientFactory } from '../../../../client/client_factory';
import { IClusterClient } from '../../../../client/client';
import { MigResource, MigResourceKind } from '../../../../client/resources';

import * as sagas from '../sagas';
import { ClusterActionTypes } from '../actions';


const watchClusterAddEditStatus = sagas.default.watchClusterAddEditStatus;

function * watchAddClusterRequest() {
  yield takeLatest(ClusterActionTypes.ADD_CLUSTER_REQUEST, mockClusterSuccess);
  yield sagas.default.watchAddClusterRequest();
}

function* watchUpdateClusterRequest() {
  yield takeLatest(ClusterActionTypes.UPDATE_CLUSTER_REQUEST, mockClusterSuccess);
  yield sagas.default.watchUpdateClusterRequest();
}

function* mockClusterSuccess(action) {
  const state = yield select();
   setTimeout(() => {
    const { migMeta } = state;
    const { clusterValues } = action;
    const client: IClusterClient = ClientFactory.hostCluster(state);

    const mockReadyStatus = {
       status: {
         conditions: [{
           lastTransitionTime: new Date(),
           type: 'Ready',
         }]
       }
     };

     client.patch(
       new MigResource(MigResourceKind.MigCluster, migMeta.namespace),
       clusterValues.name,
       mockReadyStatus);
  }, 2000);
}


export default {
  watchAddClusterRequest,
  watchUpdateClusterRequest,
  watchClusterAddEditStatus,
};
