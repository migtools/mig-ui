import { fetchingAddEditStatus } from '../../common/add_edit_state';
import { StorageActionTypes } from './actions';
import { defaultAddEditStatus } from '../../common/add_edit_state';

export const INITIAL_STATE = {
  isPolling: false,
  isFetching: false,
  isError: false,
  isLoadingStorage: false,
  migStorageList: [],
  searchTerm: '',
  addEditStatus: defaultAddEditStatus(),
};

export const migStorageFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isFetching: true };
};

export const migStorageFetchSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migStorageList: action.migStorageList,
    isFetching: false,
  };
};
export const migStorageFetchFailure = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isError: true,
    isFetching: false,
  };
};


export const addStorageRequest = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    addEditStatus: fetchingAddEditStatus(),
    isLoadingStorage: true
  };
};
export const addStorageSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migStorageList: [...state.migStorageList, action.newStorage],
    isLoadingStorage: false
  };
};
export const removeStorageSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migStorageList: state.migStorageList.filter(
      item => item.MigStorage.metadata.name !== action.name
    ),
  };
};
export const updateSearchTerm = (state = INITIAL_STATE, action) => {
  return { ...state, searchTerm: action.searchTerm };
};

export const updateStorageRequest = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    addEditStatus: fetchingAddEditStatus(),
    isLoadingStorage: true
  };
};

export const updateStorageSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migStorageList: [
      ...state.migStorageList.filter(
        s => s.MigStorage.metadata.name !== action.updatedStorage.MigStorage.metadata.name
      ),
      { ...action.updatedStorage },
    ],
    isLoadingStorage: false
  };
};

export const updateStorages = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migStorageList: action.updatedStorages,
  };
};

export const setStorageAddEditStatus = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    addEditStatus: action.status,
  };
};

export const startStoragePolling = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isPolling: true
  };
};

export const stopStoragePolling = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isPolling: false
  };
};


const storageReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case StorageActionTypes.MIG_STORAGE_FETCH_REQUEST: return migStorageFetchRequest(state, action);
    case StorageActionTypes.MIG_STORAGE_FETCH_SUCCESS: return migStorageFetchSuccess(state, action);
    case StorageActionTypes.MIG_STORAGE_FETCH_FAILURE: return migStorageFetchFailure(state, action);
    case StorageActionTypes.ADD_STORAGE_REQUEST: return addStorageRequest(state, action);
    case StorageActionTypes.ADD_STORAGE_SUCCESS: return addStorageSuccess(state, action);
    case StorageActionTypes.UPDATE_STORAGES: return updateStorages(state, action);
    case StorageActionTypes.UPDATE_STORAGE_REQUEST: return updateStorageRequest(state, action);
    case StorageActionTypes.UPDATE_STORAGE_SUCCESS: return updateStorageSuccess(state, action);
    case StorageActionTypes.REMOVE_STORAGE_SUCCESS: return removeStorageSuccess(state, action);
    case StorageActionTypes.UPDATE_SEARCH_TERM: return updateSearchTerm(state, action);
    case StorageActionTypes.SET_STORAGE_ADD_EDIT_STATUS: return setStorageAddEditStatus(state, action);
    case StorageActionTypes.STORAGE_POLL_START: return startStoragePolling(state, action);
    case StorageActionTypes.STORAGE_POLL_STOP: return stopStoragePolling(state, action);
    default: return state;
  }
};

export default storageReducer;
