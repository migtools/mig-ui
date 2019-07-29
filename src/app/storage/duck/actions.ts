import { createActions } from 'reduxsauce';
import { AddEditStatus } from '../../common/add_edit_state';

const { Creators, Types } = createActions({
  migStorageFetchRequest: [],
  migStorageFetchSuccess: ['migStorageList'],
  migStorageFetchFailure: [],
  updateStorageSearchText: ['StorageSearchText'],
  addStorageRequest: ['storageValues'],
  addStorageSuccess: ['newStorage'],
  addStorageFailure: ['error'],
  removeStorageSuccess: ['name'],
  updateSearchTerm: ['searchTerm'],
  updateStorages: ['updatedStorages'],
  updateStorageRequest: ['storageValues'],
  updateStorageSuccess: ['updatedStorage'],
  watchStorageAddEditStatus: ['storageName'],
  cancelWatchStorageAddEditStatus: [],
  setIsPollingStorage: ['isPolling'],
});

Types.SET_STORAGE_ADD_EDIT_STATUS = 'SET_STORAGE_ADD_EDIT_STATUS';
Creators.setStorageAddEditStatus = (status: AddEditStatus) => {
  return {
    type: Types.SET_STORAGE_ADD_EDIT_STATUS,
    status,
  };
};


export { Creators, Types };
