import { PlanActions, PlanActionTypes } from './actions';
import moment from 'moment';

export enum CurrentPlanState {
  Pending = 'Pending',
  Critical = 'Critical',
  Ready = 'Ready',
  TimedOut = 'Timedout',
  Warn = 'Warn'
}

export interface ICurrentPlanStatus {
  state: CurrentPlanState;
  errorMessage?: string;
  warnMessage?: string;
}

export const INITIAL_STATE = {
  isPVError: false,
  isFetchingPVList: false,
  isFetchingPVResources: false,
  isCheckingPlanStatus: false,
  isError: false,
  isFetching: false,
  migPlanList: [],
  planSearchText: '',
  sourceClusterNamespaces: [],
  currentPlan: null,
  isClosing: false,
  isPollingStatus: false,
  isPolling: false,
  pvResourceList: [],
  currentPlanStatus: {
    state: CurrentPlanState.Pending,
    errorMessage: ''
  } as ICurrentPlanStatus,
  lockedPlanList: []
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

export const migPlanFetchRequest =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.migPlanFetchRequest>) => {
    return { ...state, isFetching: true };
  };

export const migPlanFetchSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.migPlanFetchSuccess>) => {
    const sortedList = sortPlans(action.migPlanList);
    return { ...state, migPlanList: sortedList, isFetching: false };
  };
export const migPlanFetchFailure =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.migPlanFetchFailure>) => {
    return { ...state, isError: true, isFetching: false };
  };
export const pvFetchRequest =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.pvFetchRequest>) => {
    return { ...state, isPVError: false, isFetchingPVList: true };
  };
export const pvFetchFailure =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.pvFetchFailure>) => {
    return { ...state, isPVError: true, isFetchingPVList: false };
  };
export const pvFetchSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.pvFetchSuccess>) => {
    return { ...state, isPVError: false, isFetchingPVList: false };
  };

export const addPlanSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.addPlanSuccess>) => {
    const newPlan = {
      MigPlan: action.newPlan,
      Migrations: [],
    };

    return {
      ...state,
      migPlanList: [...state.migPlanList, newPlan],
    };
  };

export const addPlanFailure =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.addPlanFailure>) => {
    return {
      ...state,
    };
  };

export const addPlanRequest =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.addPlanRequest>) => {
    return {
      ...state,
    };
  };

export const removePlanSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.removePlanSuccess>) => {
    return { ...state };
  };

export const namespaceFetchRequest =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.namespaceFetchRequest>) => {
    return {
      ...state,
      sourceClusterNamespaces: [],
      isFetchingNamespaceList: true,
    };
  };
export const namespaceFetchSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.namespaceFetchSuccess>) => {
    return {
      ...state,
      sourceClusterNamespaces: action.sourceClusterNamespaces,
      isFetchingNamespaceList: false,
    };
  };
export const namespaceFetchFailure =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.namespaceFetchFailure>) => {
    return {
      ...state,
      sourceClusterNamespaces: [],
      isFetchingNamespaceList: false,
    };
  };

export const updatePlanList =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.updatePlanList>) => {
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

export const updatePlanMigrations =
  (state = INITIAL_STATE, action) => { // TODO: add migplan and migmigration typing
    const updatedPlanList = state.migPlanList.map(p => {
      if (p.MigPlan.metadata.name === action.updatedPlan.MigPlan.metadata.name) {
        //filter migrations
        // TODO: fix api for MigPlan: should not contain migrations to be sane kubeApi resource
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

export const updatePlans =
  (state = INITIAL_STATE, action) => {
    const updatedPlanList = action.updatedPlans.map(plan => {
      plan.Migrations = sortMigrations(plan.Migrations);
      const { metadata } = plan.MigPlan;
      if (metadata.annotations || metadata.generation || metadata.resourceVersion) {
        delete metadata.annotations;
        delete metadata.generation;
        delete metadata.resourceVersion;
      }
      return plan;
    });

    const sortedList = sortPlans(updatedPlanList);

    if (JSON.stringify(sortedList) === JSON.stringify(state.migPlanList)) {
      return {
        ...state
      };
    } else if
      (JSON.stringify(sortedList) !== JSON.stringify(state.migPlanList)) {

      return {
        ...state,
        migPlanList: sortedList,
      };
    }
  };

export const initStage =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.initStage>) => {
    const updatedPlan = state.migPlanList.find(p => p.MigPlan.metadata.name === action.planName);
    const filteredPlans = state.migPlanList.filter(p => p.MigPlan.metadata.name !== action.planName);

    const updatedPlansList = [...filteredPlans, updatedPlan];
    const sortedPlans = sortPlans(updatedPlansList);

    return {
      ...state,
      migPlanList: sortedPlans,
    };
  };

export const initMigration =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.initMigration>) => {
    const updatedPlan = state.migPlanList.find(p => p.MigPlan.metadata.name === action.planName);
    const filteredPlans = state.migPlanList.filter(p => p.MigPlan.metadata.name !== action.planName);

    const updatedPlansList = [...filteredPlans, updatedPlan];
    const sortedPlans = sortPlans(updatedPlansList);

    return {
      ...state,
      migPlanList: sortedPlans,
    };
  };
export const stagingSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.stagingSuccess>) => {
    const updatedPlan = state.migPlanList.find(p => p.MigPlan.metadata.name === action.planName);
    const filteredPlans = state.migPlanList.filter(p => p.MigPlan.metadata.name !== action.planName);

    const updatedPlansList = [...filteredPlans, updatedPlan];
    const sortedPlans = sortPlans(updatedPlansList);

    return {
      ...state,
      migPlanList: sortedPlans,
    };
  };
export const stagingFailure =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.stagingFailure>) => {
    return { ...state };
  };

export const migrationSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.migrationSuccess>) => {
    const updatedPlan = state.migPlanList.find(p => p.MigPlan.metadata.name === action.planName);
    const filteredPlans = state.migPlanList.filter(p => p.MigPlan.metadata.name !== action.planName);

    const updatedPlansList = [...filteredPlans, updatedPlan];
    const sortedPlans = sortPlans(updatedPlansList);

    return {
      ...state,
      migPlanList: sortedPlans,
    };
  };
export const migrationFailure =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.migrationFailure>) => {
    return { ...state };
  };


export const closedStatusPollStart =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.startClosedStatusPolling>) => {
    return { ...state, isClosing: true };
  };

export const closedStatusPollStop =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.stopClosedStatusPolling>) => {
    const filteredLockedPlans = state.lockedPlanList.filter(lockedPlanName => lockedPlanName !== action.planName);
    return {
      ...state,
      isClosing: false,
      lockedPlanList: filteredLockedPlans
    };
  };

export const planStatusPollStart =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.startPlanStatusPolling>) => {
    return { ...state, isPollingStatus: true };
  };

export const planStatusPollStop =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.stopPlanStatusPolling>) => {
    return { ...state, isPollingStatus: false };
  };

export const getPVResourcesRequest =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.getPVResourcesRequest>) => {
    return { ...state, isFetchingPVResources: true };
  };

export const getPVResourcesSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.getPVResourcesSuccess>) => {
    return { ...state, isFetchingPVResources: false, pvResourceList: action.pvResources };
  };

export const getPVResourcesFailure =
  (state = INITIAL_STATE, action: ReturnType<typeof PlanActions.getPVResourcesFailure>) => {
    return { ...state, isFetchingPVResources: false };
  };

export const startPlanPolling = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isPolling: true
  };
};

export const stopPlanPolling = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isPolling: false
  };
};

export const resetCurrentPlan = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    currentPlan: null
  };
};

export const setCurrentPlan = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    currentPlan: action.currentPlan
  };
};

export const updateCurrentPlanStatus = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.updateCurrentPlanStatus>) => {
  return {
    ...state, currentPlanStatus: action.currentPlanStatus
  };
};

export const planCloseAndDeleteSuccess = (state = INITIAL_STATE, action) => {
  const filteredLockedPlans = state.lockedPlanList.filter(lockedPlanName => lockedPlanName !== action.planName);

  return {
    ...state,
    migPlanList: state.migPlanList.filter(
      p => p.MigPlan.metadata.name !== action.planName),
    lockedPlanList: filteredLockedPlans
  };
};

export const planCloseAndDeleteFailure = (state = INITIAL_STATE, action) => {
  const filteredLockedPlans = state.lockedPlanList.filter(lockedPlanName => lockedPlanName !== action.planName);

  return {
    ...state,
    lockedPlanList: filteredLockedPlans
  };
};

export const setLockedPlan = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    lockedPlanList: [...state.lockedPlanList, action.planName]
  };
};

const planReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case PlanActionTypes.ADD_PLAN_REQUEST: return addPlanRequest(state, action);
    case PlanActionTypes.INIT_STAGE: return initStage(state, action);
    case PlanActionTypes.INIT_MIGRATION: return initMigration(state, action);
    case PlanActionTypes.MIG_PLAN_FETCH_REQUEST: return migPlanFetchRequest(state, action);
    case PlanActionTypes.MIG_PLAN_FETCH_SUCCESS: return migPlanFetchSuccess(state, action);
    case PlanActionTypes.MIG_PLAN_FETCH_FAILURE: return migPlanFetchFailure(state, action);
    case PlanActionTypes.NAMESPACE_FETCH_REQUEST: return namespaceFetchRequest(state, action);
    case PlanActionTypes.NAMESPACE_FETCH_SUCCESS: return namespaceFetchSuccess(state, action);
    case PlanActionTypes.NAMESPACE_FETCH_FAILURE: return namespaceFetchFailure(state, action);
    case PlanActionTypes.PV_FETCH_SUCCESS: return pvFetchSuccess(state, action);
    case PlanActionTypes.PV_FETCH_FAILURE: return pvFetchFailure(state, action);
    case PlanActionTypes.PV_FETCH_REQUEST: return pvFetchRequest(state, action);
    case PlanActionTypes.ADD_PLAN_SUCCESS: return addPlanSuccess(state, action);
    case PlanActionTypes.ADD_PLAN_FAILURE: return addPlanFailure(state, action);
    case PlanActionTypes.REMOVE_PLAN_SUCCESS: return removePlanSuccess(state, action);
    case PlanActionTypes.STAGING_SUCCESS: return stagingSuccess(state, action);
    case PlanActionTypes.STAGING_FAILURE: return stagingFailure(state, action);
    case PlanActionTypes.MIGRATION_SUCCESS: return migrationSuccess(state, action);
    case PlanActionTypes.MIGRATION_FAILURE: return migrationFailure(state, action);
    case PlanActionTypes.UPDATE_PLAN_LIST: return updatePlanList(state, action);
    case PlanActionTypes.UPDATE_CURRENT_PLAN_STATUS: return updateCurrentPlanStatus(state, action);
    case PlanActionTypes.UPDATE_PLAN_MIGRATIONS: return updatePlanMigrations(state, action);
    case PlanActionTypes.UPDATE_PLANS: return updatePlans(state, action);
    case PlanActionTypes.CLOSED_STATUS_POLL_START: return closedStatusPollStart(state, action);
    case PlanActionTypes.CLOSED_STATUS_POLL_STOP: return closedStatusPollStop(state, action);
    case PlanActionTypes.PLAN_STATUS_POLL_START: return planStatusPollStart(state, action);
    case PlanActionTypes.PLAN_STATUS_POLL_STOP: return planStatusPollStop(state, action);
    case PlanActionTypes.GET_PV_RESOURCES_REQUEST: return getPVResourcesRequest(state, action);
    case PlanActionTypes.GET_PV_RESOURCES_SUCCESS: return getPVResourcesSuccess(state, action);
    case PlanActionTypes.GET_PV_RESOURCES_FAILURE: return getPVResourcesFailure(state, action);
    case PlanActionTypes.PLAN_POLL_START: return startPlanPolling(state, action);
    case PlanActionTypes.PLAN_POLL_STOP: return stopPlanPolling(state, action);
    case PlanActionTypes.RESET_CURRENT_PLAN: return resetCurrentPlan(state, action);
    case PlanActionTypes.SET_CURRENT_PLAN: return setCurrentPlan(state, action);
    case PlanActionTypes.SET_LOCKED_PLAN: return setLockedPlan(state, action);
    case PlanActionTypes.PLAN_CLOSE_AND_DELETE_SUCCESS:
      return planCloseAndDeleteSuccess(state, action);
    case PlanActionTypes.PLAN_CLOSE_AND_DELETE_FAILURE:
      return planCloseAndDeleteFailure(state, action);
    default: return state;
  }
};

export default planReducer;
