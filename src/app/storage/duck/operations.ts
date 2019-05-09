import { Creators as AlertCreators } from '../../common/duck/actions';
import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import ConnectionState from '../../common/connection_state';

import {
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
} from '../../../client/resources';

import {
  createClusterRegistryObj,
  createStorageSecret,
  createMigStorage,
} from '../../../client/resources/conversions';

const migStorageFetchRequest = Creators.migStorageFetchRequest;
const migStorageFetchSuccess = Creators.migStorageFetchSuccess;
const addStorageSuccess = Creators.addStorageSuccess;
const addStorageFailure = Creators.addStorageFailure;
const removeStorageSuccess = Creators.removeStorageSuccess;
const removeStorageFailure = Creators.removeStorageFailure;
const updateSearchTerm = Creators.updateSearchTerm;

const addStorage = storageValues => {
  return async (dispatch, getState) => {
    try {
      const state = getState();
      const { migMeta } = state;
      const client: IClusterClient =
        ClientFactory.hostCluster(getState());

      const tokenSecret = createStorageSecret(
        storageValues.name,
        migMeta.namespace,
        storageValues.secret,
        storageValues.accessKey,
      );

      const migStorage = createMigStorage(
        storageValues.name,
        storageValues.bucketName,
        storageValues.region,
        migMeta.namespace,
        tokenSecret,
      );

      const secretResource = new CoreNamespacedResource(
        CoreNamespacedResourceKind.Secret,
        migMeta.configNamespace,
      );
      const migStorageResource = new MigResource(
        MigResourceKind.MigStorage,
        migMeta.namespace,
      );

      const arr = await Promise.all([
        client.create(secretResource, tokenSecret),
        client.create(migStorageResource, migStorage),
      ]);

      const storage = arr.reduce((accum, res) => {
        accum[res.data.kind] = res.data;
        return accum;
      }, {});
      storage.status = storageValues.connectionStatus;
      dispatch(addStorageSuccess(storage));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};

function checkConnection() {
  return (dispatch, getState) => {
    dispatch(Creators.setConnectionState(ConnectionState.Checking));
    setTimeout(() => {
      dispatch(Creators.setConnectionState(ConnectionState.Success));
    }, 2000);
  };
}

const removeStorage = id => {
  throw new Error('NOT IMPLEMENTED');
  // return dispatch => {
  //   removeStorageRequest(id).then(
  //     response => {
  //       dispatch(removeStorageSuccess(id));
  //       dispatch(fetchStorage());
  //     },
  //     error => {
  //       dispatch(removeStorageFailure(error));
  //     },
  //   );
  // };
};

const fetchStorage = () => {
  return async (dispatch, getState) => {
    dispatch(migStorageFetchRequest());

    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const resource = new MigResource(
        MigResourceKind.MigStorage,
        migMeta.namespace,
      );
      const res = await client.list(resource);
      //temporary for ui work
      const migStorages = res.data.items;
      const refs = await Promise.all(
        fetchMigStorageRefs(client, migMeta, migStorages),
      );
      const groupedStorages = groupStorages(migStorages, refs);
      dispatch(migStorageFetchSuccess(groupedStorages));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};
function fetchMigStorageRefs(
  client: IClusterClient,
  migMeta,
  migStorages,
): Array<Promise<any>> {
  const refs: Array<Promise<any>> = [];

  migStorages.forEach(storage => {
    const secretRef = storage.spec.backupStorageConfig.credsSecretRef;
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      secretRef.namespace,
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
    fullStorage['Secret'] = refs.find(i =>
        i.data.kind === 'Secret' && i.data.metadata.name === ms.metadata.name,
      ).data;


    return fullStorage;
  });
}

export default {
  fetchStorage,
  addStorage,
  removeStorage,
  updateSearchTerm,
  checkConnection,
};
