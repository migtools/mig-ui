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
  updateSearchTerm: ['searchTerm'],
  setConnectionState: ['connectionState'],
  updateStorages: ['updatedStorages'],
});

export { Creators, Types };
