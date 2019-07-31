import { IAddEditStatus } from '../../../common/add_edit_state';

const updateSearchTerm = (searchTerm: string) => ({
  type: Types.UPDATE_SEARCH_TERM,
  searchTerm,
});

const setIsPollingStorage = (isPolling: boolean) => ({
  type: Types.SET_IS_POLLING_STORAGE,
  isPolling,
});

const setStorageAddEditStatus = (status: IAddEditStatus) => ({
  type: Types.SET_STORAGE_ADD_EDIT_STATUS,
  status,
});

const watchStorageAddEditStatus = (storageName) => ({
  type: Types.WATCH_STORAGE_ADD_EDIT_STATUS,
  storageName,
});

const cancelWatchStorageAddEditStatus = () => ({
  type: Types.CANCEL_WATCH_STORAGE_ADD_EDIT_STATUS,
});

const addStorageRequest = (storageValues) => ({
  type: Types.ADD_STORAGE_REQUEST,
  storageValues,
});

const updateStorageRequest = (storageValues) => ({
  type: Types.UPDATE_STORAGE_REQUEST,
  storageValues,
});

export const Types = {
  UPDATE_SEARCH_TERM: 'UPDATE_SEARCH_TERM',
  SET_IS_POLLING_STORAGE: 'SET_IS_POLLING_STORAGE',
  SET_STORAGE_ADD_EDIT_STATUS: 'SET_STORAGE_ADD_EDIT_STATUS',
  WATCH_STORAGE_ADD_EDIT_STATUS: 'WATCH_STORAGE_ADD_EDIT_STATUS',
  CANCEL_WATCH_STORAGE_ADD_EDIT_STATUS: 'CANCEL_WATCH_STORAGE_ADD_EDIT_STATUS',
  ADD_STORAGE_REQUEST: 'ADD_STORAGE_REQUEST',
  UPDATE_STORAGE_REQUEST: 'UPDATE_STORAGE_REQUEST',
};

export const Creators = {
  updateSearchTerm,
  setIsPollingStorage,
  setStorageAddEditStatus,
  watchStorageAddEditStatus,
  cancelWatchStorageAddEditStatus,
  addStorageRequest,
  updateStorageRequest,
};
