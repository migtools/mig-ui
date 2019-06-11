import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  migPlanFetchRequest: [],
  migPlanFetchSuccess: ['migPlanList'],
  migPlanFetchFailure: [],
  pvFetchRequest: [],
  pvFetchFailure: [],
  pvFetchSuccess: [],
  addPlanSuccess: ['newPlan'],
  addPlanFailure: ['error'],
  removePlanSuccess: ['id'],
  updatePlanProgress: ['planName', 'progress'],
  initStage: ['planName'],
  stagingSuccess: ['planName'],
  sourceClusterNamespacesFetchSuccess: ['sourceClusterNamespaces'],
  initMigration: ['planName'],
  migrationSuccess: ['planName'],
  updatePlan: ['updatedPlan'],
  updatePlanMigrations: ['updatedPlan'],
});

export { Creators, Types };
