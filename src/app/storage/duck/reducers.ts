import Types from './types';
import { createReducer } from 'reduxsauce';
export const INITIAL_STATE = {
  isFetching: false,
  migrationStorageList: [],
  StorageSearchText: '',
};

export const migrationStorageFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, migrationStorageList: action.migrationStorageList };
};

export const addStorageSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migrationStorageList: [...state.migrationStorageList, action.newStorage],
  };
};
export const removeStorageSuccess = (state = INITIAL_STATE, action) => {
  return { ...state };
};

export const HANDLERS = {
  [Types.MIGRATION_STORAGE_FETCH_SUCCESS]: migrationStorageFetchSuccess,
  [Types.ADD_STORAGE_SUCCESS]: addStorageSuccess,
  [Types.REMOVE_STORAGE_SUCCESS]: removeStorageSuccess,
};

export default createReducer(INITIAL_STATE, HANDLERS);
