import { ClusterActionTypes } from './actions';
import {
  defaultAddEditStatus,
  fetchingAddEditStatus,
  IAddEditStatus,
} from '../../common/add_edit_state';
import { ICluster } from './types';

export interface IClusterReducerState {
  isFetchingInitialClusters: boolean;
  isPolling: boolean;
  isError: boolean;
  isFetching: boolean;
  clusterList: ICluster[];
  searchTerm: string;
  addEditStatus: IAddEditStatus;
  currentCluster: ICluster;
}

type ClusterReducerFn = (state: IClusterReducerState, action: any) => IClusterReducerState;

export const INITIAL_STATE: IClusterReducerState = {
  currentCluster: null,
  isFetchingInitialClusters: true,
  isPolling: false,
  isError: false,
  isFetching: false,
  clusterList: [],
  searchTerm: '',
  addEditStatus: defaultAddEditStatus(),
};

export const clusterFetchSuccess: ClusterReducerFn = (state = INITIAL_STATE, action) => {
  return { ...state, clusterList: action.clusterList, isFetching: false };
};

export const clusterFetchFailure: ClusterReducerFn = (state = INITIAL_STATE, action) => {
  return { ...state, isError: true, isFetching: false };
};

export const clusterFetchRequest: ClusterReducerFn = (state = INITIAL_STATE, action) => {
  return { ...state, isFetchingInitialClusters: true };
};

export const addClusterRequest: ClusterReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    addEditStatus: fetchingAddEditStatus(),
  };
};
export const addClusterSuccess: ClusterReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: [...state.clusterList, action.newCluster],
  };
};

export const removeClusterSuccess: ClusterReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    clusterList: state.clusterList.filter((item) => item.MigCluster.metadata.name !== action.name),
  };
};

export const updateClusterRequest: ClusterReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    addEditStatus: fetchingAddEditStatus(),
  };
};

export const updateClusters: ClusterReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isFetchingInitialClusters: false,
    clusterList: action.updatedClusters,
  };
};

export const setClusterAddEditStatus: ClusterReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    addEditStatus: action.status,
  };
};

export const startClusterPolling: ClusterReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isPolling: true,
  };
};

export const stopClusterPolling: ClusterReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isPolling: false,
  };
};

export const clusterReducer: ClusterReducerFn = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ClusterActionTypes.ADD_CLUSTER_REQUEST:
      return addClusterRequest(state, action);
    case ClusterActionTypes.SET_CLUSTER_ADD_EDIT_STATUS:
      return setClusterAddEditStatus(state, action);
    case ClusterActionTypes.CLUSTER_FETCH_REQUEST:
      return clusterFetchRequest(state, action);
    case ClusterActionTypes.CLUSTER_FETCH_SUCCESS:
      return clusterFetchSuccess(state, action);
    case ClusterActionTypes.CLUSTER_FETCH_FAILURE:
      return clusterFetchFailure(state, action);
    case ClusterActionTypes.ADD_CLUSTER_SUCCESS:
      return addClusterSuccess(state, action);
    case ClusterActionTypes.UPDATE_CLUSTERS:
      return updateClusters(state, action);
    case ClusterActionTypes.REMOVE_CLUSTER_SUCCESS:
      return removeClusterSuccess(state, action);
    case ClusterActionTypes.CLUSTER_POLL_START:
      return startClusterPolling(state, action);
    case ClusterActionTypes.CLUSTER_POLL_STOP:
      return stopClusterPolling(state, action);
    default:
      return state;
  }
};

export default clusterReducer;
