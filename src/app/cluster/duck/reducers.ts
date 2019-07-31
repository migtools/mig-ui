import { ChangeTypes } from './change_actions';
import { FetchTypes } from './fetch_actions';
import { ClusterRequestActions, ClusterRequestTypes } from './request_actions';
import { createReducer } from 'reduxsauce';
import { defaultAddEditStatus, fetchingAddEditStatus } from '../../common/add_edit_state';

export const INITIAL_STATE = {
  isPolling: false,
  isError: false,
  isFetching: false,
  clusterList: [],
  searchTerm: '',
  addEditStatus: defaultAddEditStatus(),
};

export const clusterFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, clusterList: action.clusterList, isFetching: false };
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

export const addClusterRequest = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    addEditStatus: fetchingAddEditStatus(),
  };
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

export const updateClusterRequest = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    addEditStatus: fetchingAddEditStatus(),
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
  return {
    ...state,
    addEditStatus: action.status,
  };
};

export const HANDLERS = {
  [ClusterRequestTypes.ADD_CLUSTER_REQUEST]: addClusterRequest,
  [ChangeTypes.SET_CLUSTER_ADD_EDIT_STATUS]: setClusterAddEditStatus,
  [FetchTypes.CLUSTER_FETCH_REQUEST]: clusterFetchRequest,
  [FetchTypes.CLUSTER_FETCH_SUCCESS]: clusterFetchSuccess,
  [FetchTypes.CLUSTER_FETCH_FAILURE]: clusterFetchFailure,
  [ChangeTypes.ADD_CLUSTER_SUCCESS]: addClusterSuccess,
  [ChangeTypes.UPDATE_CLUSTERS]: updateClusters,
  [ChangeTypes.UPDATE_CLUSTER_SUCCESS]: updateClusterSuccess,
  [ChangeTypes.REMOVE_CLUSTER_SUCCESS]: removeClusterSuccess,
  [ChangeTypes.SET_IS_POLLING_CLUSTER]: setIsPollingCluster,
};

export default createReducer(INITIAL_STATE, HANDLERS);
