import { createSelector } from 'reselect';

const clusterSelector = (state) =>
    state.cluster.clusterList.map(c => c);

const searchTermSelector = state => state.cluster.searchTerm;

const getAllClusters = createSelector(
    [clusterSelector],
    (clusters) => {
        return clusters;
    },
);

const getVisibleClusters = createSelector(
    [clusterSelector, searchTermSelector],
    (clusters, searchTerm) => {
      return clusters.filter(cluster => {
        return cluster.MigCluster.metadata.name.match(new RegExp(searchTerm, 'i'))
      });
    },
);
export default {
    getAllClusters,
    getVisibleClusters,
};
