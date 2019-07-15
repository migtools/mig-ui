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
  updateClusterSuccess: ['updatedCluster'],
});

export { Creators, Types };
