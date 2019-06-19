import { createSelector } from 'reselect';

const clusterSelector = state => state.cluster.clusterList.map(c => c);

const planSelector = state => state.plan.migPlanList.map(p => p);

const getAllClusters = createSelector(
  [clusterSelector],
  clusters => {
    return clusters;
  }
);

const getAssociatedPlans = createSelector(
  [clusterSelector, planSelector],
  (clusterList, plans) => {
    return clusterList.reduce((associatedPlans, cluster) => {
      const clusterName = cluster.MigCluster.metadata.name;
      associatedPlans[clusterName] = plans.reduce((count, plan) => {
        const isAssociated =
          plan.MigPlan.spec.srcMigClusterRef.name === clusterName ||
          plan.MigPlan.spec.destMigClusterRef.name === clusterName;
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
