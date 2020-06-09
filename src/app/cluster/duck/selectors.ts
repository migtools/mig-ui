import { createSelector } from 'reselect';
import { ICluster } from './types';

const clusterSelectorWithStatus = (state) =>
  state.cluster.clusterList.map((cluster: ICluster) => {
    let hasReadyCondition = null;
    let hasCriticalCondition = null;

    if (!cluster.MigCluster.status || !cluster.MigCluster.status.conditions) {
      const emptyStatusObject = {
        hasReadyCondition,
        hasCriticalCondition,
      };
      return { ...cluster, ClusterStatus: emptyStatusObject };
    }
    hasReadyCondition = !!cluster.MigCluster.status.conditions.some((c) => c.type === 'Ready');
    hasCriticalCondition = !!cluster.MigCluster.status.conditions.some(
      (c) => c.type === 'Critical'
    );
    const statusObject = {
      hasReadyCondition,
      hasCriticalCondition,
    };

    return { ...cluster, ClusterStatus: statusObject };
  });

const planSelector = (state) => state.plan.migPlanList.map((p) => p);

const getAllClusters = createSelector([clusterSelectorWithStatus], (clusters) => {
  return clusters;
});

const getAssociatedPlans = createSelector(
  [clusterSelectorWithStatus, planSelector],
  (clusterList, plans) => {
    return clusterList.reduce((associatedPlans, cluster: ICluster) => {
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
