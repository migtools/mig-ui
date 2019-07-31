

interface IMigPlan {
  MigPlan: object;
  MigMigrations: object[];
}

const updatePlans = (updatedPlans: IMigPlan[]) => ({
  type: ChangeActionTypes.UPDATE_PLANS,
  updatedPlans,
});

const addPlanSuccess = (newPlan: IMigPlan) => ({
  type: ChangeActionTypes.ADD_PLAN_SUCCESS,
  newPlan,
});

const addPlanFailure = (error) => ({
  type: ChangeActionTypes.ADD_PLAN_FAILURE,
  error,
});

const updatePlanResults = (results: string) => ({
  type: ChangeActionTypes.UPDATE_PLAN_RESULTS,
  results,
});

const removePlanSuccess = (id) => ({
  type: ChangeActionTypes.REMOVE_PLAN_SUCCESS,
  id,
});

const updateStageProgress = (planName: string, progress: any) => ({
  type: ChangeActionTypes.UPDATE_STAGE_PROGRESS,
  planName,
  progress,
});

const stagingSuccess = (planName: string) => ({
  type: ChangeActionTypes.STAGING_SUCCESS,
  planName,
});

const stagingFailure = (err) => ({
  type: ChangeActionTypes.STAGING_FAILURE,
  err,
});

const migrationSuccess = (planName: string) => ({
  type: ChangeActionTypes.MIGRATION_SUCCESS,
  planName,
});

const migrationFailure = (err) => ({
  type: ChangeActionTypes.MIGRATION_FAILURE,
  err
});

const updatePlan = (updatedPlan: IMigPlan) => ({
  type: ChangeActionTypes.UPDATE_PLAN,
  updatedPlan,
});

const updatePlanMigrations = (updatedPlan: IMigPlan) => ({
  type: ChangeActionTypes.UPDATE_PLAN_MIGRATIONS,
  updatedPlan,
});

const planDeleteSuccess = (planName: string) => ({
  type:
  planName,
});

export const ChangeActionTypes = {
  UPDATE_PLANS: 'UPDATE_PLANS',
  ADD_PLAN_SUCCESS: 'ADD_PLAN_SUCCESS',
  ADD_PLAN_FAILURE: 'ADD_PLAN_FAILURE',
  UPDATE_PLAN_RESULTS: 'UPDATE_PLAN_RESULTS',
  REMOVE_PLAN_SUCCESS: 'REMOVE_PLAN_SUCCESS',
  UPDATE_STAGE_PROGRESS: 'UPDATE_STAGE_PROGRESS',
  STAGING_SUCCESS: 'STAGING_SUCCESS',
  STAGING_FAILURE: 'STAGING_FAILURE',
  MIGRATION_SUCCESS: 'MIGRATION_SUCCESS',
  MIGRATION_FAILURE: 'MIGRATION_FAILURE',
  UPDATE_PLAN: 'UPDATE_PLAN',
  UPDATE_PLAN_MIGRATIONS: 'UPDATE_PLAN_MIGRATIONS',
  PLAN_DELETE_SUCCESS: 'PLAN_DELETE_SUCCESS',
};

export const ChangeActions = {
  updatePlans,
  addPlanSuccess,
  addPlanFailure,
  updatePlanResults,
  removePlanSuccess,
  updateStageProgress,
  stagingSuccess,
  stagingFailure,
  migrationSuccess,
  migrationFailure,
  updatePlan,
  updatePlanMigrations,
  planDeleteSuccess,
};
