import { Types } from './actions';
import { createReducer } from 'reduxsauce';
export const INITIAL_STATE = {
  isFetching: false,
  migStorageList: [],
  StorageSearchText: '',
};

export const migStorageFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, migStorageList: action.migStorageList };
};

export const addStorageSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migStorageList: [...state.migStorageList, action.newStorage],
  };
};
export const removeStorageSuccess = (state = INITIAL_STATE, action) => {
  return { ...state };
};

export const HANDLERS = {
  [Types.MIG_STORAGE_FETCH_SUCCESS]: migStorageFetchSuccess,
  [Types.ADD_STORAGE_SUCCESS]: addStorageSuccess,
  [Types.REMOVE_STORAGE_SUCCESS]: removeStorageSuccess,
};

export default createReducer(INITIAL_STATE, HANDLERS);
