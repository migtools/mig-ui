import { Types } from './actions';
import { createReducer } from 'reduxsauce';
import { defaultAddEditStatus } from '../../common/add_edit_state';

export const INITIAL_STATE = {
  isPolling: false,
  isError: false,
  isFetching: false,
  clusterList: [],
  searchTerm: '',
  addEditStatus: defaultAddEditStatus(),
};

export const clusterFetchSuccess = (state = INITIAL_STATE, action) => {
  // TODO: Obviously this needs to be removed when connected is actually implemented!
  const clusterList = action.clusterList.map(cluster => {
    cluster.status = 'success';
    return cluster;
  });
  return { ...state, clusterList, isFetching: false };
};

export const clusterFetchFailure = (state = INITIAL_STATE, action) => {
  return { ...state, isError: true, isFetching: false };
};

export const clusterFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isFetching: true };
};

export const setIsPollingCluster = (state = INITIAL_STATE, action) => {
  return { ...state, isPolling: action.isPolling };
};

export const addClusterSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: [...state.clusterList, action.newCluster],
  };
};

export const removeClusterSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: state.clusterList.filter(item => item.MigCluster.metadata.name !== action.name),
  };
};

export const updateClusterSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: [
      ...state.clusterList.filter(
        s => s.MigCluster.metadata.name !== action.updatedCluster.MigCluster.metadata.name
      ),
      { ...action.updatedCluster },
    ],
  };
};

export const updateClusters = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: action.updatedClusters,
  };
};

export const setClusterAddEditStatus = (state = INITIAL_STATE, action) => {
  return{
    ...state,
    addEditStatus: action.status,
  };
};

export const HANDLERS = {
  [Types.CLUSTER_FETCH_REQUEST]: clusterFetchRequest,
  [Types.CLUSTER_FETCH_SUCCESS]: clusterFetchSuccess,
  [Types.CLUSTER_FETCH_FAILURE]: clusterFetchFailure,
  [Types.ADD_CLUSTER_SUCCESS]: addClusterSuccess,
  [Types.UPDATE_CLUSTERS]: updateClusters,
  [Types.UPDATE_CLUSTER_SUCCESS]: updateClusterSuccess,
  [Types.REMOVE_CLUSTER_SUCCESS]: removeClusterSuccess,
  [Types.SET_IS_POLLING_CLUSTER]: setIsPollingCluster,
  [Types.SET_CLUSTER_ADD_EDIT_STATUS]: setClusterAddEditStatus,
};

export default createReducer(INITIAL_STATE, HANDLERS);
