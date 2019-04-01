import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  migStorageFetchSuccess: ['migStorageList'],
  updateStorageSearchText: ['StorageSearchText'],
  addStorageSuccess: ['newStorage'],
  addStorageFailure: ['error'],
  removeStorageSuccess: ['id'],
});

export { Creators, Types };
