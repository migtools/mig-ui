import { IAddEditStatus } from '../../common/add_edit_state';
import { IMigCluster } from '../../../client/resources/conversions';
import { ICluster } from './types';

export const ClusterActionTypes = {
  UPDATE_CLUSTERS: 'UPDATE_CLUSTERS',
  ADD_CLUSTER_SUCCESS: 'ADD_CLUSTER_SUCCESS',
  ADD_CLUSTER_FAILURE: 'ADD_CLUSTER_FAILURE',
  REMOVE_CLUSTER_REQUEST: 'REMOVE_CLUSTER_REQUEST',
  REMOVE_CLUSTER_SUCCESS: 'REMOVE_CLUSTER_SUCCESS',
  REMOVE_CLUSTER_FAILURE: 'REMOVE_CLUSTER_FAILURE',
  UPDATE_CLUSTER_SUCCESS: 'UPDATE_CLUSTER_SUCCESS',
  UPDATE_SERACH_TERM: 'UPDATE_SERACH_TERM',
  SET_CLUSTER_ADD_EDIT_STATUS: 'SET_CLUSTER_ADD_EDIT_STATUS',
  WATCH_CLUSTER_ADD_EDIT_STATUS: 'WATCH_CLUSTER_ADD_EDIT_STATUS',
  CANCEL_WATCH_CLUSTER_ADD_EDIT_STATUS: 'CANCEL_WATCH_CLUSTER_ADD_EDIT_STATUS',
  CLUSTER_FETCH_SUCCESS: 'CLUSTER_FETCH_SUCCESS',
  CLUSTER_FETCH_REQUEST: 'CLUSTER_FETCH_REQUEST',
  CLUSTER_FETCH_FAILURE: 'CLUSTER_FETCH_FAILURE',
  ADD_CLUSTER_REQUEST: 'ADD_CLUSTER_REQUEST',
  UPDATE_CLUSTER_REQUEST: 'UPDATE_CLUSTER_REQUEST',
  CLUSTER_POLL_START: 'CLUSTER_POLL_START',
  CLUSTER_POLL_STOP: 'CLUSTER_POLL_STOP',
  SET_CURRENT_CLUSTER: 'SET_CURRENT_CLUSTER',
  INIT_DISCOVERY_CERT: 'INIT_DISCOVERY_CERT',
  RESET_CLUSTER_PAGE: 'RESET_CLUSTER_PAGE',
};

const initializeDiscoveryCert = () => ({
  type: ClusterActionTypes.INIT_DISCOVERY_CERT,
});

const updateClusters = (updatedClusters: IMigCluster[]) => ({
  type: ClusterActionTypes.UPDATE_CLUSTERS,
  updatedClusters,
});

const addClusterSuccess = (newCluster: IMigCluster) => ({
  type: ClusterActionTypes.ADD_CLUSTER_SUCCESS,
  newCluster,
});
const addClusterFailure = (error: any) => ({
  type: ClusterActionTypes.ADD_CLUSTER_FAILURE,
  error,
});

const removeClusterRequest = (name: string) => ({
  type: ClusterActionTypes.REMOVE_CLUSTER_REQUEST,
  name,
});

const removeClusterSuccess = (name: string) => ({
  type: ClusterActionTypes.REMOVE_CLUSTER_SUCCESS,
  name,
});

const removeClusterFailure = (err: any) => ({
  type: ClusterActionTypes.REMOVE_CLUSTER_FAILURE,
  err,
});

const updateSearchTerm = (searchTerm: string) => ({
  type: ClusterActionTypes.UPDATE_SERACH_TERM,
  searchTerm,
});

const setClusterAddEditStatus = (status: IAddEditStatus) => ({
  type: ClusterActionTypes.SET_CLUSTER_ADD_EDIT_STATUS,
  status,
});

const watchClusterAddEditStatus = (clusterName: string) => ({
  type: ClusterActionTypes.WATCH_CLUSTER_ADD_EDIT_STATUS,
  clusterName,
});

const cancelWatchClusterAddEditStatus = () => ({
  type: ClusterActionTypes.CANCEL_WATCH_CLUSTER_ADD_EDIT_STATUS,
});

const clusterFetchSuccess = (clusterList: IMigCluster[]) => ({
  type: ClusterActionTypes.CLUSTER_FETCH_SUCCESS,
  clusterList,
});

const clusterFetchRequest = () => ({
  type: ClusterActionTypes.CLUSTER_FETCH_REQUEST,
});

const clusterFetchFailure = () => ({
  type: ClusterActionTypes.CLUSTER_FETCH_FAILURE,
});

const addClusterRequest = (clusterValues: any) => ({
  type: ClusterActionTypes.ADD_CLUSTER_REQUEST,
  clusterValues,
});

const updateClusterRequest = (clusterValues: any) => ({
  type: ClusterActionTypes.UPDATE_CLUSTER_REQUEST,
  clusterValues,
});

const startClusterPolling = (params?: any) => ({
  type: ClusterActionTypes.CLUSTER_POLL_START,
  params,
});

const stopClusterPolling = () => ({
  type: ClusterActionTypes.CLUSTER_POLL_STOP,
});

const setCurrentCluster = (currentCluster: ICluster) => {
  return {
    type: ClusterActionTypes.SET_CURRENT_CLUSTER,
    currentCluster,
  };
};

const resetClusterPage = () => ({
  type: ClusterActionTypes.RESET_CLUSTER_PAGE,
});

export const ClusterActions = {
  updateClusters,
  addClusterSuccess,
  addClusterFailure,
  removeClusterRequest,
  removeClusterSuccess,
  removeClusterFailure,
  updateSearchTerm,
  setClusterAddEditStatus,
  watchClusterAddEditStatus,
  cancelWatchClusterAddEditStatus,
  clusterFetchSuccess,
  clusterFetchRequest,
  clusterFetchFailure,
  addClusterRequest,
  updateClusterRequest,
  startClusterPolling,
  stopClusterPolling,
  setCurrentCluster,
  initializeDiscoveryCert,
  resetClusterPage,
};
