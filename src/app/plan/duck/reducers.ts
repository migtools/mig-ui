import { Types } from './actions';
import { createReducer } from 'reduxsauce';
export const INITIAL_STATE = {
  isFetching: false,
  migPlanList: [],
  planStateMap: [],
  planSearchText: '',
  sourceClusterNamespaces: [],
  isStaging: false,
  isMigrating: false,
};

export const migPlanFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isFetching: true };
};

export const migPlanFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, migPlanList: action.migPlanList, isFetching: false };
};

export const addPlanSuccess = (state = INITIAL_STATE, action) => {
  const planState = {
    migrations: [],
    status: {
      state: 'Not Started',
      progress: 0,
    },
  };
  const newPlan = { ...action.newPlan, ...planState };

  return {
    ...state,
    migPlanList: [...state.migPlanList, newPlan],
  };
};

export const removePlanSuccess = (state = INITIAL_STATE, action) => {
  return { ...state };
};

export const sourceClusterNamespacesFetchSuccess = (
  state = INITIAL_STATE,
  action,
) => {
  return { ...state, sourceClusterNamespaces: action.sourceClusterNamespaces };
};

export const updatePlanProgress = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.planName === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.planName !== action.planName);

  updatedPlan.status.progress = action.progress;

  return {
    ...state,
    migPlanList: [...filteredPlans, updatedPlan],
  };
};

export const initStage = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.planName === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.planName !== action.planName);

  updatedPlan.status = {
    state: 'Staging',
    progress: 0,
  };

  updatedPlan.migrations = [...updatedPlan.migrations, 'stage'];

  return {
    ...state,
    migPlanList: [...filteredPlans, updatedPlan],
    isStaging: true,
  };
};

export const stagingSuccess = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.planName === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.planName !== action.planName);

  updatedPlan.status = {
    state: 'Staged Successfully',
    progress: 0,
  };

  return {
    ...state,
    migPlanList: [...filteredPlans, updatedPlan],
    isStaging: false,
  };
};

export const initMigration = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.MigPlan.metadata.name === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.MigPlan.metadata.name !== action.planName);

  updatedPlan.planState.status = {
    state: 'Migrating',
    progress: 0,
  };

  updatedPlan.planState.migrations = [...updatedPlan.planState.migrations, 'migration'];

  return {
    ...state,
    migPlanList: [...filteredPlans, updatedPlan],
    isMigrating: true,
  };
};

export const migrationSuccess = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.MigPlan.metadata.name === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.MigPlan.metadata.name !== action.planName);

  updatedPlan.planState.status = {
    state: 'Migrated Successfully',
    progress: 0,
  };

  return {
    ...state,
    migPlanList: [...filteredPlans, updatedPlan],
    isMigrating: false,
  };
};

export const HANDLERS = {
  [Types.MIG_PLAN_FETCH_REQUEST]: migPlanFetchRequest,
  [Types.MIG_PLAN_FETCH_SUCCESS]: migPlanFetchSuccess,
  [Types.ADD_PLAN_SUCCESS]: addPlanSuccess,
  [Types.REMOVE_PLAN_SUCCESS]: removePlanSuccess,
  [Types.SOURCE_CLUSTER_NAMESPACES_FETCH_SUCCESS]: sourceClusterNamespacesFetchSuccess,
  [Types.UPDATE_PLAN_PROGRESS]: updatePlanProgress,
  [Types.INIT_STAGE]: initStage,
  [Types.STAGING_SUCCESS]: stagingSuccess,
  [Types.INIT_MIGRATION]: initMigration,
  [Types.MIGRATION_SUCCESS]: migrationSuccess,
};

export default createReducer(INITIAL_STATE, HANDLERS);
