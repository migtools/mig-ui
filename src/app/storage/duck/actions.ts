import { IAddEditStatus } from '../../common/add_edit_state';
import { IMigStorage } from '../../../client/resources/conversions';
import { IStorage } from './types';

export const StorageActionTypes = {
  MIG_STORAGE_FETCH_REQUEST: 'MIG_STORAGE_FETCH_REQUEST',
  MIG_STORAGE_FETCH_SUCCESS: 'MIG_STORAGE_FETCH_SUCCESS',
  MIG_STORAGE_FETCH_FAILURE: 'MIG_STORAGE_FETCH_FAILURE',
  UPDATE_SEARCH_TERM: 'UPDATE_SEARCH_TERM',
  SET_STORAGE_ADD_EDIT_STATUS: 'SET_STORAGE_ADD_EDIT_STATUS',
  WATCH_STORAGE_ADD_EDIT_STATUS: 'WATCH_STORAGE_ADD_EDIT_STATUS',
  CANCEL_WATCH_STORAGE_ADD_EDIT_STATUS: 'CANCEL_WATCH_STORAGE_ADD_EDIT_STATUS',
  UPDATE_STORAGE_REQUEST: 'UPDATE_STORAGE_REQUEST',
  UPDATE_STORAGE_SEARCH_TEXT: 'UPDATE_STORAGE_SEARCH_TEXT',
  ADD_STORAGE_REQUEST: 'ADD_STORAGE_REQUEST',
  ADD_STORAGE_SUCCESS: 'ADD_STORAGE_SUCCESS',
  ADD_STORAGE_FAILURE: 'ADD_STORAGE_FAILURE',
  REMOVE_STORAGE_REQUEST: 'REMOVE_STORAGE_REQUEST',
  REMOVE_STORAGE_FAILURE: 'REMOVE_STORAGE_FAILURE',
  REMOVE_STORAGE_SUCCESS: 'REMOVE_STORAGE_SUCCESS',
  UPDATE_STORAGE_SUCCESS: 'UPDATE_STORAGE_SUCCESS',
  UPDATE_STORAGES: 'UPDATE_STORAGES',
  STORAGE_POLL_START: 'STORAGE_POLL_START',
  STORAGE_POLL_STOP: 'STORAGE_POLL_STOP',
  RESET_STORAGE_PAGE: 'RESET_STORAGE_PAGE',
  SET_CURRENT_STORAGE: 'SET_CURRENT_STORAGE',
};

const updateStorageSearchText = (StorageSearchText: string) => ({
  type: StorageActionTypes.UPDATE_STORAGE_SEARCH_TEXT,
  StorageSearchText,
});

const addStorageSuccess = (newStorage: IMigStorage) => ({
  type: StorageActionTypes.ADD_STORAGE_SUCCESS,
  newStorage,
});

const addStorageFailure = (error) => ({
  type: StorageActionTypes.ADD_STORAGE_FAILURE,
  error,
});

const removeStorageRequest = (name: string) => ({
  type: StorageActionTypes.REMOVE_STORAGE_REQUEST,
  name,
});

const removeStorageFailure = (storageName: string) => ({
  type: StorageActionTypes.REMOVE_STORAGE_FAILURE,
  storageName,
});

const removeStorageSuccess = (name: string) => ({
  type: StorageActionTypes.REMOVE_STORAGE_SUCCESS,
  name,
});

const updateStorageSuccess = (updatedStorage: IMigStorage) => ({
  type: StorageActionTypes.UPDATE_STORAGE_SUCCESS,
  updatedStorage,
});

const updateStorages = (updatedStorages: IMigStorage[]) => ({
  type: StorageActionTypes.UPDATE_STORAGES,
  updatedStorages,
});

const migStorageFetchRequest = () => ({
  type: StorageActionTypes.MIG_STORAGE_FETCH_REQUEST,
});

const migStorageFetchSuccess = (migStorageList: IMigStorage[]) => ({
  type: StorageActionTypes.MIG_STORAGE_FETCH_SUCCESS,
  migStorageList,
});

const migStorageFetchFailure = () => ({
  type: StorageActionTypes.MIG_STORAGE_FETCH_FAILURE,
});

const updateSearchTerm = (searchTerm: string) => ({
  type: StorageActionTypes.UPDATE_SEARCH_TERM,
  searchTerm,
});

const setStorageAddEditStatus = (status: IAddEditStatus) => ({
  type: StorageActionTypes.SET_STORAGE_ADD_EDIT_STATUS,
  status,
});

const watchStorageAddEditStatus = (storageName) => ({
  type: StorageActionTypes.WATCH_STORAGE_ADD_EDIT_STATUS,
  storageName,
});

const cancelWatchStorageAddEditStatus = () => ({
  type: StorageActionTypes.CANCEL_WATCH_STORAGE_ADD_EDIT_STATUS,
});

const addStorageRequest = (storageValues) => ({
  type: StorageActionTypes.ADD_STORAGE_REQUEST,
  storageValues,
});

const updateStorageRequest = (storageValues) => ({
  type: StorageActionTypes.UPDATE_STORAGE_REQUEST,
  storageValues,
});

const startStoragePolling = (params?: any) => ({
  type: StorageActionTypes.STORAGE_POLL_START,
  params,
});

const stopStoragePolling = () => ({
  type: StorageActionTypes.STORAGE_POLL_STOP,
});

const resetStoragePage = () => ({
  type: StorageActionTypes.RESET_STORAGE_PAGE,
});

const setCurrentStorage = (currentStorage: IStorage) => {
  return {
    type: StorageActionTypes.SET_CURRENT_STORAGE,
    currentStorage,
  };
};

export const StorageActions = {
  updateSearchTerm,
  setStorageAddEditStatus,
  watchStorageAddEditStatus,
  cancelWatchStorageAddEditStatus,
  migStorageFetchRequest,
  migStorageFetchSuccess,
  migStorageFetchFailure,
  updateStorageSearchText,
  addStorageRequest,
  updateStorageRequest,
  addStorageSuccess,
  addStorageFailure,
  removeStorageRequest,
  removeStorageFailure,
  removeStorageSuccess,
  updateStorageSuccess,
  updateStorages,
  startStoragePolling,
  stopStoragePolling,
  resetStoragePage,
  setCurrentStorage,
};
