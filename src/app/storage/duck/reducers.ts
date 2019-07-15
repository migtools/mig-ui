import { Types } from './actions';
import { createReducer } from 'reduxsauce';

export const INITIAL_STATE = {
  isFetching: false,
  isError: false,
  migStorageList: [],
  connectionState: { status: 'Not Ready', isReady: null },
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

export const resetConnectionState = (state = INITIAL_STATE, action) => {
  return { ...state, connectionState: { status: 'Not Ready', isReady: null } };
};

export const addStorageSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migStorageList: [...state.migStorageList, action.newStorage],
    connectionState: { status: 'Ready', isReady: true },
  };
};
export const addStorageFailure = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    connectionState: { status: 'Connection Failed', isReady: false },
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

export const HANDLERS = {
  [Types.MIG_STORAGE_FETCH_REQUEST]: migStorageFetchRequest,
  [Types.MIG_STORAGE_FETCH_SUCCESS]: migStorageFetchSuccess,
  [Types.MIG_STORAGE_FETCH_FAILURE]: migStorageFetchFailure,
  [Types.ADD_STORAGE_SUCCESS]: addStorageSuccess,
  [Types.ADD_STORAGE_FAILURE]: addStorageFailure,
  [Types.UPDATE_STORAGES]: updateStorages,
  [Types.UPDATE_STORAGE_SUCCESS]: updateStorageSuccess,
  [Types.REMOVE_STORAGE_SUCCESS]: removeStorageSuccess,
  [Types.RESET_CONNECTION_STATE]: resetConnectionState,
};

export default createReducer(INITIAL_STATE, HANDLERS);
