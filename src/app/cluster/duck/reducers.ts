import { Types } from './actions';
import { createReducer } from 'reduxsauce';
export const INITIAL_STATE = {
  isFetching: false,
  clusterList: [],
};

export const clusterFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, clusterList: action.clusterList, isFetching: false };
};
export const clusterFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isFetching: true };
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

export const HANDLERS = {
  [Types.CLUSTER_FETCH_REQUEST]: clusterFetchRequest,
  [Types.CLUSTER_FETCH_SUCCESS]: clusterFetchSuccess,
  [Types.ADD_CLUSTER_SUCCESS]: addClusterSuccess,
  [Types.REMOVE_CLUSTER_SUCCESS]: removeClusterSuccess,
};

export default createReducer(INITIAL_STATE, HANDLERS);
