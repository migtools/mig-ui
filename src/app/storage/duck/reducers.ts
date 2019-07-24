import { Types } from './actions';
import { createReducer } from 'reduxsauce';
import { defaultAddEditStatus } from '../../common/add_edit_state';

export const INITIAL_STATE = {
  isPolling: false,
  isFetching: false,
  isError: false,
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

export const setIsPollingStorage = (state = INITIAL_STATE, action) => {
  return { ...state, isPolling: action.isPolling };
};

export const addStorageSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migStorageList: [...state.migStorageList, action.newStorage],
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

export const updateStorageSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migStorageList: [
      ...state.migStorageList.filter(
        s => s.MigStorage.metadata.name !== action.updatedStorage.MigStorage.metadata.name
      ),
      { ...action.updatedStorage },
    ],
  };
};

export const updateStorages = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migStorageList: action.updatedStorages,
  };
};

export const setStorageAddEditStatus = (state = INITIAL_STATE, action) => {
  return{
    ...state,
    addEditStatus: action.status,
  }
}

export const HANDLERS = {
  [Types.MIG_STORAGE_FETCH_REQUEST]: migStorageFetchRequest,
  [Types.MIG_STORAGE_FETCH_SUCCESS]: migStorageFetchSuccess,
  [Types.MIG_STORAGE_FETCH_FAILURE]: migStorageFetchFailure,
  [Types.ADD_STORAGE_SUCCESS]: addStorageSuccess,
  [Types.UPDATE_STORAGES]: updateStorages,
  [Types.UPDATE_STORAGE_SUCCESS]: updateStorageSuccess,
  [Types.REMOVE_STORAGE_SUCCESS]: removeStorageSuccess,
  [Types.UPDATE_SEARCH_TERM]: updateSearchTerm,
  [Types.SET_STORAGE_ADD_EDIT_STATUS]: setStorageAddEditStatus,
  [Types.SET_IS_POLLING_STORAGE]: setIsPollingStorage,
};

export default createReducer(INITIAL_STATE, HANDLERS);
