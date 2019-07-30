import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { select } from 'redux-saga/effects';

import { CoreNamespacedResource, CoreNamespacedResourceKind } from '../../../client/resources';

import {
  alertSuccessTimeout,
  alertErrorTimeout,
} from '../../common/duck/actions';

const removeStorageSuccess = Creators.removeStorageSuccess;
const updateSearchTerm = Creators.updateSearchTerm;

const removeStorage = name => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const { migMeta } = state;
      const client: IClusterClient = ClientFactory.hostCluster(state);

      const secretResource = new CoreNamespacedResource(
        CoreNamespacedResourceKind.Secret,
        migMeta.namespace
      );
      const migStorageResource = new MigResource(MigResourceKind.MigStorage, migMeta.namespace);

      const arr = await Promise.all([
        client.delete(secretResource, name),
        client.delete(migStorageResource, name),
      ]);

      dispatch(removeStorageSuccess(name));
      dispatch(alertSuccessTimeout(`Successfully removed repository "${name}"!`));
    } catch (err) {
      dispatch(alertErrorTimeout(err));
    }
  };
};

function fetchMigStorageRefs(client: IClusterClient, migMeta, migStorages): Array<Promise<any>> {
  const refs: Array<Promise<any>> = [];

  migStorages.forEach(storage => {
    const secretRef = storage.spec.backupStorageConfig.credsSecretRef;
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      secretRef.namespace
    );
    refs.push(client.get(secretResource, secretRef.name));
  });

  return refs;
}

function groupStorages(migStorages: any[], refs: any[]): any[] {
  return migStorages.map(ms => {
    const fullStorage = {
      MigStorage: ms,
    };
    fullStorage['Secret'] = refs.find(
      i => i.data.kind === 'Secret' && i.data.metadata.name === ms.metadata.name
    ).data;

    return fullStorage;
  });
}

function* fetchStorageGenerator() {
  const state = yield select();
  const client: IClusterClient = ClientFactory.hostCluster(state);
  const resource = new MigResource(MigResourceKind.MigStorage, state.migMeta.namespace);
  try {
    let storageList = yield client.list(resource);
    storageList = yield storageList.data.items;
    const refs = yield Promise.all(fetchMigStorageRefs(client, state.migMeta, storageList));
    const groupedStorages = groupStorages(storageList, refs);
    return { updatedStorages: groupedStorages, isSuccessful: true };
  } catch (e) {
    return { e, isSuccessful: false };
  }
}

export default {
  fetchStorageGenerator,
  removeStorage,
  updateSearchTerm,
};
