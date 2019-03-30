import { Creators as AlertCreators } from '../../common/duck/actions';
import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';

const migStorageFetchSuccess = Creators.migStorageFetchSuccess;
const addStorageSuccess = Creators.addStorageSuccess;
const addStorageFailure = Creators.addStorageFailure;
const removeStorageSuccess = Creators.removeStorageSuccess;
const removeStorageFailure = Creators.removeStorageFailure;

const addStorage = migStorage => {
  return (dispatch, getState) => {
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const resource = new MigResource(
        MigResourceKind.MigStorage, migMeta.namespace);
      client.create(resource, migStorage)
        .then(res => dispatch(addStorageSuccess(res.data)))
        .catch(err => AlertCreators.alertError('Failed to add storage'));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};

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
  return (dispatch, getState) => {
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const resource = new MigResource(
        MigResourceKind.MigStorage, migMeta.namespace);
      client.list(resource)
        .then(res => dispatch(migStorageFetchSuccess(res.data)))
        .catch(err => AlertCreators.alertError('Failed to get clusters'));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};

export default {
  fetchStorage,
  addStorage,
  removeStorage,
};
