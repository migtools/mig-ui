import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  clusterFetchSuccess: ['clusterList'],
  updateClusterSearchText: ['clusterSearchText'],
  addClusterSuccess: ['newCluster'],
  addClusterFailure: ['error'],
  removeClusterSuccess: ['id'],
});

export { Creators, Types };
