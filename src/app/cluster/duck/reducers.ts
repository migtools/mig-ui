import { ClusterActionTypes } from './actions';
import { defaultAddEditStatus, fetchingAddEditStatus } from '../../common/add_edit_state';
import moment from 'moment';

export const INITIAL_STATE = {
  isPolling: false,
  isError: false,
  isFetching: false,
  clusterList: [],
  searchTerm: '',
  addEditStatus: defaultAddEditStatus(),
};

const sortClusters = clusterList =>
  clusterList.sort((left, right) => {
    return moment
      .utc(right.MigCluster.metadata.creationTimestamp)
      .diff(moment.utc(left.MigCluster.metadata.creationTimestamp));
  });

export const clusterFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, clusterList: action.clusterList, isFetching: false };
};

export const clusterFetchFailure = (state = INITIAL_STATE, action) => {
  return { ...state, isError: true, isFetching: false };
};

export const clusterFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isFetching: true };
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
  const updatedClusterList = action.updatedClusters.map(cluster => {
    const { metadata } = cluster.MigCluster;
    if (metadata.annotations || metadata.generation || metadata.resourceVersion) {
      delete metadata.annotations;
      delete metadata.generation;
      delete metadata.resourceVersion;
    }
    if (cluster.MigCluster.status) {
      for (let i = 0; cluster.MigCluster.status.conditions.length > i; i++) {
        delete cluster.MigCluster.status.conditions[i].lastTransitionTime;
      }
    }
    return cluster;
  });

  const sortedList = sortClusters(updatedClusterList);

  if (JSON.stringify(sortedList) === JSON.stringify(state.clusterList)) {
    return {
      ...state
    };
  } else if
    (JSON.stringify(sortedList) !== JSON.stringify(state.clusterList)) {

    return {
      ...state,
      clusterList: sortedList,
    };
  }

};

export const setClusterAddEditStatus = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    addEditStatus: action.status,
  };
};

export const startClusterPolling = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isPolling: true
  };
};

export const stopClusterPolling = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isPolling: false
  };
};

export const clusterReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ClusterActionTypes.ADD_CLUSTER_REQUEST: return addClusterRequest(state, action);
    case ClusterActionTypes.SET_CLUSTER_ADD_EDIT_STATUS: return setClusterAddEditStatus(state, action);
    case ClusterActionTypes.CLUSTER_FETCH_REQUEST: return clusterFetchRequest(state, action);
    case ClusterActionTypes.CLUSTER_FETCH_SUCCESS: return clusterFetchSuccess(state, action);
    case ClusterActionTypes.CLUSTER_FETCH_FAILURE: return clusterFetchFailure(state, action);
    case ClusterActionTypes.ADD_CLUSTER_SUCCESS: return addClusterSuccess(state, action);
    case ClusterActionTypes.UPDATE_CLUSTERS: return updateClusters(state, action);
    case ClusterActionTypes.UPDATE_CLUSTER_SUCCESS: return updateClusterSuccess(state, action);
    case ClusterActionTypes.REMOVE_CLUSTER_SUCCESS: return removeClusterSuccess(state, action);
    case ClusterActionTypes.CLUSTER_POLL_START: return startClusterPolling(state, action);
    case ClusterActionTypes.CLUSTER_POLL_STOP: return stopClusterPolling(state, action);
    default: return state;
  }
};

export default clusterReducer;
