import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  clusterFetchSuccess: ['clusterList'],
  clusterFetchRequest: [],
  clusterFetchFailure: [],
  updateSearchTerm: ['searchTerm'],
  addClusterSuccess: ['newCluster'],
  addClusterFailure: ['error'],
  removeClusterSuccess: ['name'],
  setConnectionState: ['connectionState'],
  updateClusterSuccess: ['updatedCluster'],
});

export { Creators, Types };
