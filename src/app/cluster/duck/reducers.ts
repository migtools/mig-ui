import { Types } from './actions';
import { createReducer } from 'reduxsauce';
export const INITIAL_STATE = {
  isFetching: false,
  clusterList: [],
  searchTerm: '',
  isConnected: false,
};

export const clusterFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, clusterList: action.clusterList, isFetching: false };
};
export const clusterFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isFetching: true };
};
export const checkConnectionSuccess = (state = INITIAL_STATE, action) => {
  return {...state, isConnected: action.connected};
};
export const addClusterSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: [...state.clusterList, action.newCluster],
  };
};
export const removeClusterSuccess = (state = INITIAL_STATE, action) => {
  return { ...state };
};

export const updateSearchTerm = (state = INITIAL_STATE, action) => {
  return { ...state, searchTerm: action.searchTerm };
};

export const HANDLERS = {
  [Types.CLUSTER_FETCH_REQUEST]: clusterFetchRequest,
  [Types.CLUSTER_FETCH_SUCCESS]: clusterFetchSuccess,
  [Types.ADD_CLUSTER_SUCCESS]: addClusterSuccess,
  [Types.REMOVE_CLUSTER_SUCCESS]: removeClusterSuccess,
  [Types.UPDATE_SEARCH_TERM]: updateSearchTerm,
  [Types.SET_CONNECTED]: checkConnectionSuccess,
};

export default createReducer(INITIAL_STATE, HANDLERS);
