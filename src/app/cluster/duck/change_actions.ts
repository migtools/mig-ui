import { IAddEditStatus } from '../../common/add_edit_state';

const updateClusters = (updatedClusters) => ({
  type: ChangeTypes.UPDATE_CLUSTERS,
  updatedClusters,
});

const addClusterSuccess = (newCluster) => ({
  type: ChangeTypes.ADD_CLUSTER_SUCCESS,
  newCluster,
});

const addClusterFailure = (error) => ({
  type: ChangeTypes.ADD_CLUSTER_FAILURE,
  error,
});

const removeClusterSuccess = (name) => ({
  type: ChangeTypes.REMOVE_CLUSTER_SUCCESS,
  name,
});

const removeClusterFailure = (err) => ({
  type: ChangeTypes.REMOVE_CLUSTER_FAILURE,
  err,
});

const updateClusterSuccess = (updatedCluster) => ({
  type: ChangeTypes.UPDATE_CLUSTER_SUCCESS,
  updatedCluster,
});

const updateSearchTerm = (searchTerm) => ({
  type: ChangeTypes.UPDATE_SERACH_TERM,
  searchTerm,
});

const setIsPollingCluster = (isPolling: boolean) => ({
  type: ChangeTypes.SET_IS_POLLING_CLUSTER,
  isPolling
});

const setClusterAddEditStatus = (status: IAddEditStatus) => ({
    type: ChangeTypes.SET_CLUSTER_ADD_EDIT_STATUS,
    status,
});

const watchClusterAddEditStatus = (clusterName) => ({
  type: ChangeTypes.WATCH_CLUSTER_ADD_EDIT_STATUS,
  clusterName,
});

const cancelWatchClusterAddEditStatus = () => ({
  type: ChangeTypes.CANCEL_WATCH_CLUSTER_ADD_EDIT_STATUS,
});

export const ChangeTypes = {
  UPDATE_CLUSTERS: 'UPDATE_CLUSTERS',
  ADD_CLUSTER_SUCCESS: 'ADD_CLUSTER_SUCCESS',
  ADD_CLUSTER_FAILURE: 'ADD_CLUSTER_FAILURE',
  REMOVE_CLUSTER_SUCCESS: 'REMOVE_CLUSTER_SUCCESS',
  REMOVE_CLUSTER_FAILURE: 'REMOVE_CLUSTER_FAILURE',
  UPDATE_CLUSTER_SUCCESS: 'UPDATE_CLUSTER_SUCCESS',
  UPDATE_SERACH_TERM: 'UPDATE_SERACH_TERM',
  SET_IS_POLLING_CLUSTER: 'SET_IS_POLLING_CLUSTER',
  SET_CLUSTER_ADD_EDIT_STATUS: 'SET_CLUSTER_ADD_EDIT_STATUS',
  WATCH_CLUSTER_ADD_EDIT_STATUS: 'WATCH_CLUSTER_ADD_EDIT_STATUS',
  CANCEL_WATCH_CLUSTER_ADD_EDIT_STATUS: 'CANCEL_WATCH_CLUSTER_ADD_EDIT_STATUS',
};

export const ChangeActions = {
  updateClusters,
  addClusterSuccess,
  addClusterFailure,
  removeClusterSuccess,
  removeClusterFailure,
  updateClusterSuccess,
  updateSearchTerm,
  setIsPollingCluster,
  setClusterAddEditStatus,
  watchClusterAddEditStatus,
  cancelWatchClusterAddEditStatus,
};
