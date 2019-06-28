import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  startStatusPolling: ['params'],
  stopStatusPolling: [],
  updatePlans: ['updatedPlans'],
  migPlanFetchRequest: [],
  migPlanFetchSuccess: ['migPlanList'],
  migPlanFetchFailure: [],
  pvFetchRequest: [],
  pvFetchFailure: [],
  pvFetchSuccess: [],
  addPlanSuccess: ['newPlan'],
  addPlanFailure: ['error'],
  removePlanSuccess: ['id'],
  initStage: ['planName'],
  stagingSuccess: ['planName'],
  stagingFailure: [],
  sourceClusterNamespacesFetchSuccess: ['sourceClusterNamespaces'],
  initMigration: ['planName'],
  migrationSuccess: ['planName'],
  migrationFailure: [],
  updatePlan: ['updatedPlan'],
  updatePlanMigrations: ['updatedPlan'],
});

export { Creators, Types };
