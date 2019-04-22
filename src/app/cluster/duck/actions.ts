import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  clusterFetchSuccess: ['clusterList'],
  clusterFetchRequest: [],
  updateSearchTerm: ['searchTerm'],
  addClusterSuccess: ['newCluster'],
  addClusterFailure: ['error'],
  removeClusterSuccess: ['id'],
  setConnected: ['connected'],
});

export { Creators, Types };
