import { Types } from './actions';
import { createReducer } from 'reduxsauce';

export const INITIAL_STATE = {
  isError: false,
  isFetching: false,
  isCheckingConnection: false,
  clusterList: [],
  connectionState: { status: 'Not Ready', isReady: null },
};

export const clusterFetchFailure = (state = INITIAL_STATE, action) => {
  return { ...state, isError: true, isFetching: false };
};
export const clusterFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isFetching: true };
};
export const resetConnectionState = (state = INITIAL_STATE, action) => {
  return { ...state, connectionState: { status: 'Not Ready', isReady: null } };
};
export const addClusterRequest = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isCheckingConnection: true,
    connectionState: { status: 'checking', isReady: null },
  };
};
export const addClusterSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: [...state.clusterList, action.newCluster],
    isCheckingConnection: false,
    connectionState: { status: 'Ready', isReady: true },
  };
};
export const addClusterFailure = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isCheckingConnection: false,
    connectionState: { status: 'Connection Failed', isReady: false },
  };
};
export const removeClusterSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: state.clusterList.filter(item => item.MigCluster.metadata.name !== action.name),
  };
};

export const updateClusterRequest = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isCheckingConnection: true,
    connectionState: { status: 'checking', isReady: null },
  };
};

export const updateClusterSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: [
      ...state.clusterList.filter(
        s => s.Cluster.metadata.name !== action.updatedCluster.MigCluster.metadata.name
      ),
      { ...action.updatedCluster },
    ],
  };
};

export const updateClusterFailure = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isCheckingConnection: false,
    connectionState: { status: 'Connection Failed', isReady: false },
  };
};

export const updateClusters = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: action.updatedClusters,
  };
};

export const HANDLERS = {
  [Types.CLUSTER_FETCH_REQUEST]: clusterFetchRequest,
  [Types.CLUSTER_FETCH_FAILURE]: clusterFetchFailure,
  [Types.ADD_CLUSTER_REQUEST]: addClusterRequest,
  [Types.ADD_CLUSTER_SUCCESS]: addClusterSuccess,
  [Types.ADD_CLUSTER_FAILURE]: addClusterFailure,
  [Types.UPDATE_CLUSTERS]: updateClusters,
  [Types.UPDATE_CLUSTER_REQUEST]: updateClusterRequest,
  [Types.UPDATE_CLUSTER_SUCCESS]: updateClusterSuccess,
  [Types.UPDATE_CLUSTER_FAILURE]: updateClusterFailure,
  [Types.REMOVE_CLUSTER_SUCCESS]: removeClusterSuccess,
  [Types.RESET_CONNECTION_STATE]: resetConnectionState,
};

export default createReducer(INITIAL_STATE, HANDLERS);
