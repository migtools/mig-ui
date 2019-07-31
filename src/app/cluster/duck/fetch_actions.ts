const clusterFetchSuccess = (clusterList) => ({
  type: FetchTypes.CLUSTER_FETCH_SUCCESS,
  clusterList,
});

const clusterFetchRequest = () => ({
  type: FetchTypes.CLUSTER_FETCH_REQUEST,
});

const clusterFetchFailure = () => ({
  type: FetchTypes.CLUSTER_FETCH_FAILURE,
});

export const FetchTypes = {
  CLUSTER_FETCH_SUCCESS: 'CLUSTER_FETCH_SUCCESS',
  CLUSTER_FETCH_REQUEST: 'CLUSTER_FETCH_REQUEST',
  CLUSTER_FETCH_FAILURE: 'CLUSTER_FETCH_FAILURE',
};

export const FetchActions = {
  clusterFetchSuccess,
  clusterFetchRequest,
  clusterFetchFailure,
};
