import { takeLatest, select } from 'redux-saga/effects';
import { ClientFactory } from '../../../../client/client_factory';
import { IClusterClient } from '../../../../client/client';
import { MigResource, MigResourceKind } from '../../../../client/resources';

import * as sagas from '../sagas';
import { StorageActionTypes } from '../actions';


const watchStorageAddEditStatus = sagas.default.watchStorageAddEditStatus;

function* watchAddStorageRequest() {
  yield takeLatest(StorageActionTypes.ADD_STORAGE_REQUEST, mockStatusSuccess);
  yield sagas.default.watchAddStorageRequest();
}

function* watchUpdateStorageRequest() {
  yield takeLatest(StorageActionTypes.UPDATE_STORAGE_REQUEST, mockStatusSuccess);
  yield sagas.default.watchUpdateStorageRequest();
}

function* mockStatusSuccess(action) {
  const state = yield select();
  setTimeout(() => {
    const { migMeta } = state;
    const { storageValues } = action;
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
      new MigResource(MigResourceKind.MigStorage, migMeta.namespace),
      storageValues.name,
      mockReadyStatus);
  }, 2000);
}


export default {
  watchAddStorageRequest,
  watchUpdateStorageRequest,
  watchStorageAddEditStatus,
};
