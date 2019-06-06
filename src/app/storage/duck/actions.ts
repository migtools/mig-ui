import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  migStorageFetchRequest: [],
  migStorageFetchSuccess: ['migStorageList'],
  migStorageFetchFailure: [],
  updateStorageSearchText: ['StorageSearchText'],
  addStorageSuccess: ['newStorage'],
  addStorageFailure: ['error'],
  removeStorageSuccess: ['id'],
  updateSearchTerm: ['searchTerm'],
  setConnectionState: ['connectionState'],
});

export { Creators, Types };
