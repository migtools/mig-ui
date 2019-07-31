import { RequestActionTypes } from './actions/request_actions';
import { ChangeActionTypes } from './actions/change_actions';
import { FetchActionTypes } from './actions/fetch_actions';
import { createReducer } from 'reduxsauce';
import moment from 'moment';

export const INITIAL_STATE = {
  isPVError: false,
  isFetchingPVList: false,
  isCheckingPlanStatus: false,
  isError: false,
  isFetching: false,
  migPlanList: [],
  planSearchText: '',
  sourceClusterNamespaces: [],
  isStaging: false,
  isMigrating: false,
};
const sortPlans = planList =>
  planList.sort((left, right) => {
    return moment
      .utc(right.MigPlan.metadata.creationTimestamp)
      .diff(moment.utc(left.MigPlan.metadata.creationTimestamp));
  });
const sortMigrations = migList =>
  migList.sort((left, right) => {
    return moment
      .utc(right.metadata.creationTimestamp)
      .diff(moment.utc(left.metadata.creationTimestamp));
  });

export const migPlanFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isFetching: true };
};

export const migPlanFetchSuccess = (state = INITIAL_STATE, action) => {
  const sortedList = sortPlans(action.migPlanList);
  return { ...state, migPlanList: sortedList, isFetching: false };
};
export const migPlanFetchFailure = (state = INITIAL_STATE, action) => {
  return { ...state, isError: true, isFetching: false };
};
export const pvFetchRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isPVError: false, isFetchingPVList: true };
};
export const pvFetchFailure = (state = INITIAL_STATE, action) => {
  return { ...state, isPVError: true, isFetchingPVList: false };
};
export const pvFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, isPVError: false, isFetchingPVList: false };
};

export const addPlanSuccess = (state = INITIAL_STATE, action) => {
  const newPlan = {
    MigPlan: action.newPlan,
    Migrations: [],
  };

  return {
    ...state,
    migPlanList: [...state.migPlanList, newPlan],
  };
};

export const addPlanFailure = (state = INITIAL_STATE, action) => {
  return {
    ...state,
  };
};

export const addPlanRequest = (state = INITIAL_STATE, action) => {
  return {
    ...state,
  };
};

export const removePlanSuccess = (state = INITIAL_STATE, action) => {
  return { ...state };
};

export const namespaceFetchRequest = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    sourceClusterNamespaces: [],
    isFetchingNamespaceList: true,
  };
};
export const namespaceFetchSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    sourceClusterNamespaces: action.sourceClusterNamespaces,
    isFetchingNamespaceList: false,
  };
};
export const namespaceFetchFailure = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    sourceClusterNamespaces: [],
    isFetchingNamespaceList: false,
  };
};

export const updatePlan = (state = INITIAL_STATE, action) => {
  const updatedPlanList = state.migPlanList.map(p => {
    if (p.MigPlan.metadata.name === action.updatedPlan.metadata.name) {
      return {
        MigPlan: action.updatedPlan,
        Migrations: [],
      };
    } else {
      return p;
    }
  });
  const sortedList = sortPlans(updatedPlanList);

  return {
    ...state,
    migPlanList: sortedList,
  };
};

export const updatePlanMigrations = (state = INITIAL_STATE, action) => {
  const updatedPlanList = state.migPlanList.map(p => {
    if (p.MigPlan.metadata.name === action.updatedPlan.MigPlan.metadata.name) {
      //filter migrations
      action.updatedPlan.Migrations = sortMigrations(action.updatedPlan.Migrations);
      return action.updatedPlan;
    } else {
      return p;
    }
  });

  const sortedList = sortPlans(updatedPlanList);

  return {
    ...state,
    migPlanList: sortedList,
  };
};

export const updatePlans = (state = INITIAL_STATE, action) => {
  const updatedPlanList = action.updatedPlans.map(p => {
    //filter migrations
    p.Migrations = sortMigrations(p.Migrations);
    return p;
  });

  const sortedList = sortPlans(updatedPlanList);

  return {
    ...state,
    migPlanList: sortedList,
  };
};

export const initStage = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.MigPlan.metadata.name === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.MigPlan.metadata.name !== action.planName);

  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
    isStaging: true,
  };
};

export const initMigration = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.MigPlan.metadata.name === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.MigPlan.metadata.name !== action.planName);

  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
    isMigrating: true,
  };
};
export const stagingSuccess = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.MigPlan.metadata.name === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.MigPlan.metadata.name !== action.planName);

  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
    isStaging: false,
  };
};
export const stagingFailure = (state = INITIAL_STATE, action) => {
  return { ...state, isStaging: false };
};

export const migrationSuccess = (state = INITIAL_STATE, action) => {
  const updatedPlan = state.migPlanList.find(p => p.MigPlan.metadata.name === action.planName);
  const filteredPlans = state.migPlanList.filter(p => p.MigPlan.metadata.name !== action.planName);

  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
    isMigrating: false,
  };
};
export const migrationFailure = (state = INITIAL_STATE, action) => {
  return { ...state, isMigrating: false };
};

export const planResultsRequest = (state = INITIAL_STATE, action) => {
  return { ...state, isCheckingPlanStatus: true };
};

export const updatePlanResults = (state = INITIAL_STATE, action) => {
  return { ...state, isCheckingPlanStatus: false };
};

export const HANDLERS = {
  [RequestActionTypes.PLAN_RESULTS_REQUEST]: planResultsRequest,
  [RequestActionTypes.ADD_PLAN_REQUEST]: addPlanRequest,
  [RequestActionTypes.INIT_STAGE]: initStage,
  [RequestActionTypes.INIT_MIGRATION]: initMigration,
  [FetchActionTypes.MIG_PLAN_FETCH_REQUEST]: migPlanFetchRequest,
  [FetchActionTypes.MIG_PLAN_FETCH_SUCCESS]: migPlanFetchSuccess,
  [FetchActionTypes.MIG_PLAN_FETCH_FAILURE]: migPlanFetchFailure,
  [FetchActionTypes.NAMESPACE_FETCH_REQUEST]: namespaceFetchRequest,
  [FetchActionTypes.NAMESPACE_FETCH_SUCCESS]: namespaceFetchSuccess,
  [FetchActionTypes.NAMESPACE_FETCH_FAILURE]: namespaceFetchFailure,
  [FetchActionTypes.PV_FETCH_SUCCESS]: pvFetchSuccess,
  [FetchActionTypes.PV_FETCH_FAILURE]: pvFetchFailure,
  [FetchActionTypes.PV_FETCH_REQUEST]: pvFetchRequest,
  [ChangeActionTypes.UPDATE_PLAN_RESULTS]: updatePlanResults,
  [ChangeActionTypes.ADD_PLAN_SUCCESS]: addPlanSuccess,
  [ChangeActionTypes.ADD_PLAN_FAILURE]: addPlanFailure,
  [ChangeActionTypes.REMOVE_PLAN_SUCCESS]: removePlanSuccess,
  [ChangeActionTypes.STAGING_SUCCESS]: stagingSuccess,
  [ChangeActionTypes.STAGING_FAILURE]: stagingFailure,
  [ChangeActionTypes.MIGRATION_SUCCESS]: migrationSuccess,
  [ChangeActionTypes.MIGRATION_FAILURE]: migrationFailure,
  [ChangeActionTypes.UPDATE_PLAN]: updatePlan,
  [ChangeActionTypes.UPDATE_PLAN_MIGRATIONS]: updatePlanMigrations,
  [ChangeActionTypes.UPDATE_PLANS]: updatePlans,
};

export default createReducer(INITIAL_STATE, HANDLERS);
