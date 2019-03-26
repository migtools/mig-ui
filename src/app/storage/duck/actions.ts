import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  migrationStorageFetchSuccess: ['migrationStorageList'],
  updateStorageSearchText: ['StorageSearchText'],
  addStorageSuccess: ['newStorage'],
  addStorageFailure: ['error'],
  removeStorageSuccess: ['id'],
});

export { Creators, Types };
