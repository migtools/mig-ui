import { createActions } from 'reduxsauce';

const { Creators, Types } = createActions({
  startPVPolling: ['params'],
  stopPVPolling: [],
  updatePlans: ['updatedPlans'],
  migPlanFetchRequest: [],
  migPlanFetchSuccess: ['migPlanList'],
  migPlanFetchFailure: [],
  pvFetchRequest: [],
  pvFetchFailure: [],
  pvFetchSuccess: [],
  addPlanRequest: [],
  addPlanSuccess: ['newPlan'],
  addPlanFailure: ['error'],
  planResultsRequest: [],
  updatePlanResults: ['results'],
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
