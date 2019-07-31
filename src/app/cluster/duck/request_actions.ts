const addClusterRequest = (clusterValues: any) => ({
  type: ClusterRequestTypes.ADD_CLUSTER_REQUEST,
  clusterValues
});

const updateClusterRequest = (clusterValues: any) => ({
  type: ClusterRequestTypes.UPDATE_CLUSTER_REQUEST,
  clusterValues,
});

export const ClusterRequestTypes = {
  ADD_CLUSTER_REQUEST: 'ADD_CLUSTER_REQUEST',
  UPDATE_CLUSTER_REQUEST: 'UPDATE_CLUSTER_REQUEST',
};

export const ClusterRequestActions = {
  addClusterRequest,
  updateClusterRequest,
};
