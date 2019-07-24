import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  clusterFetchSuccess: ['clusterList'],
  clusterFetchRequest: [],
  clusterFetchFailure: [],
  updateClusters: ['updatedClusters'],
  addClusterSuccess: ['newCluster'],
  addClusterFailure: ['error'],
  removeClusterSuccess: ['name'],
  updateClusterSuccess: ['updatedCluster'],
});

export { Creators, Types };
