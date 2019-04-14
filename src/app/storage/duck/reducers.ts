import { Types } from './actions';
import { createReducer } from 'reduxsauce';
export const INITIAL_STATE = {
  isFetching: false,
  migStorageList: [],
  searchTerm: '',
};

export const migStorageFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isFetching: true };
};
export const migStorageFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, migStorageList: action.migStorageList, isFetching: false };
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
export const updateSearchTerm = (state = INITIAL_STATE, action) => {
  return { ...state, searchTerm: action.searchTerm };
};

export const HANDLERS = {
  [Types.MIG_STORAGE_FETCH_REQUEST]: migStorageFetchRequest,
  [Types.MIG_STORAGE_FETCH_SUCCESS]: migStorageFetchSuccess,
  [Types.ADD_STORAGE_SUCCESS]: addStorageSuccess,
  [Types.REMOVE_STORAGE_SUCCESS]: removeStorageSuccess,
  [Types.UPDATE_SEARCH_TERM]: updateSearchTerm,
};

export default createReducer(INITIAL_STATE, HANDLERS);
