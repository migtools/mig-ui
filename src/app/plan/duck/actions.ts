import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  migPlanFetchSuccess: ['migPlanList'],
  addPlanSuccess: ['newPlan'],
  addPlanFailure: ['error'],
  removePlanSuccess: ['id'],
  sourceClusterNamespacesFetchSuccess: ['sourceClusterNamespaces'],
});

export { Creators, Types };
