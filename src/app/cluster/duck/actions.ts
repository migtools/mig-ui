import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  clusterFetchSuccess: ['clusterList'],
  clusterFetchRequest: [],
  clusterFetchFailure: [],
  updateClusters: ['updatedClusters'],
  addClusterRequest: [],
  addClusterSuccess: ['newCluster'],
  addClusterFailure: ['error'],
  removeClusterSuccess: ['name'],
  resetConnectionState: [],
  updateClusterRequest: [],
  updateClusterSuccess: ['updatedCluster'],
  updateClusterFailure: [],
});

export { Creators, Types };
