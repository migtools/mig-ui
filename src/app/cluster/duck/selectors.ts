import { createSelector } from 'reselect';
import planSelectors from '../../plan/duck/selectors';

const clusterSelector = state => state.cluster.clusterList.map(c => c);

const getAllClusters = createSelector(
  [clusterSelector],
  clusters => {
    return clusters;
  }
);

const getAssociatedPlans = createSelector(
  [clusterSelector, planSelectors.getAllPlans],
  (clusterList, plans) => {
    return clusterList.reduce((associatedPlans, cluster) => {
      const clusterName = cluster.MigCluster.metadata.name;
      associatedPlans[clusterName] = plans.reduce((count, plan) => {
        const isAssociated =
          plan.sourceCluster === clusterName || plan.targetCluster === clusterName;
        return isAssociated ? count + 1 : count;
      }, 0);
      return associatedPlans;
    }, {});
  }
);
export default {
  getAllClusters,
  getAssociatedPlans,
};
