import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  migrationClusterFetchSuccess: ['migrationClusterList'],
  updateClusterSearchText: ['clusterSearchText'],
  addClusterSuccess: ['newCluster'],
  addClusterFailure: ['error'],
  removeClusterSuccess: ['id'],
});

export { Creators, Types };
