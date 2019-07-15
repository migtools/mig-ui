import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  migStorageFetchRequest: [],
  migStorageFetchSuccess: ['migStorageList'],
  migStorageFetchFailure: [],
  updateStorageSearchText: ['StorageSearchText'],
  addStorageSuccess: ['newStorage'],
  addStorageFailure: ['error'],
  removeStorageSuccess: ['name'],
  updateStorageSuccess: ['updatedStorage'],
  resetConnectionState: [],
  updateStorages: ['updatedStorages'],
});

export { Creators, Types };
