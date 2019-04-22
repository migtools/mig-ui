import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  migPlanFetchSuccess: ['migPlanList'],
  addPlanSuccess: ['newPlan'],
  addPlanFailure: ['error'],
  removePlanSuccess: ['id'],
  updatePlanProgress: ['planName', 'progress'],
  initStage: ['planName'],
  stagingSuccess: ['planName'],
  sourceClusterNamespacesFetchSuccess: ['sourceClusterNamespaces'],
  initMigration: ['planName'],
  migrationSuccess: ['planName'],
});

export { Creators, Types };
