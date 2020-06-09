import { PlanActions, PlanActionTypes } from './actions';
import moment from 'moment';
import {
  defaultAddEditStatus,
  fetchingAddEditStatus,
  IAddEditStatus,
} from '../../common/add_edit_state';
import {
  IPlan,
  ISourceClusterNamespace,
  IMigPlan,
  IPersistentVolumeResource,
  IMigration,
} from './types';
import { IMigHook } from '../../../client/resources/conversions';

export enum CurrentPlanState {
  Pending = 'Pending',
  Critical = 'Critical',
  Ready = 'Ready',
  TimedOut = 'Timedout',
  Warn = 'Warn',
}

export interface ICurrentPlanStatus {
  state: CurrentPlanState;
  errorMessage?: string;
  warnMessage?: string;
}

export interface IPlanReducerState {
  isPVError: boolean;
  isFetchingPVList: boolean;
  isPVPolling: boolean;
  isFetchingPVResources: boolean;
  isCheckingPlanStatus: boolean;
  isError: boolean;
  isFetching: boolean;
  migPlanList: IPlan[];
  planSearchText: string;
  sourceClusterNamespaces: ISourceClusterNamespace[];
  currentPlan: IMigPlan;
  isPollingStatus: boolean;
  isPolling: boolean;
  pvResourceList: IPersistentVolumeResource[];
  currentPlanStatus: ICurrentPlanStatus;
  lockedPlanList: string[]; // Plan names
  isFetchingHookList: boolean;
  migHookList: IMigHook[];
  hookAddEditStatus: IAddEditStatus;
}

type PlanReducerFn = (state: IPlanReducerState, action: any) => IPlanReducerState;

export const INITIAL_STATE: IPlanReducerState = {
  isPVError: false,
  isFetchingPVList: false,
  isPVPolling: false,
  isFetchingPVResources: false,
  isCheckingPlanStatus: false,
  isError: false,
  isFetching: false,
  migPlanList: [],
  planSearchText: '',
  sourceClusterNamespaces: [],
  currentPlan: null,
  isPollingStatus: false,
  isPolling: false,
  pvResourceList: [],
  currentPlanStatus: {
    state: CurrentPlanState.Pending,
    errorMessage: '',
  } as ICurrentPlanStatus,
  lockedPlanList: [],
  isFetchingHookList: false,
  migHookList: [],
  hookAddEditStatus: defaultAddEditStatus(),
};

const sortPlans = (planList: IPlan[]) =>
  planList.sort((left, right) => {
    return moment
      .utc(right.MigPlan.metadata.creationTimestamp)
      .diff(moment.utc(left.MigPlan.metadata.creationTimestamp));
  });
const sortMigrations = (migList: IMigration[]) =>
  migList.sort((left, right) => {
    return moment
      .utc(right.metadata.creationTimestamp)
      .diff(moment.utc(left.metadata.creationTimestamp));
  });

export const migPlanFetchRequest: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.migPlanFetchRequest>
) => {
  return { ...state, isFetching: true };
};

export const migPlanFetchSuccess: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.migPlanFetchSuccess>
) => {
  const sortedList = sortPlans(action.migPlanList);
  return { ...state, migPlanList: sortedList, isFetching: false };
};
export const migPlanFetchFailure: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.migPlanFetchFailure>
) => {
  return { ...state, isError: true, isFetching: false };
};

export const addPlanRequest: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.addPlanRequest>
) => {
  return { ...state };
};

export const addPlanSuccess: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.addPlanSuccess>
) => {
  const newPlan = {
    MigPlan: action.newPlan,
    Migrations: [],
  } as IPlan;

  return {
    ...state,
    migPlanList: [...state.migPlanList, newPlan],
  };
};

export const addPlanFailure: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.addPlanFailure>
) => {
  return {
    ...state,
  };
};

export const removePlanSuccess: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.removePlanSuccess>
) => {
  return { ...state };
};

export const namespaceFetchRequest: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.namespaceFetchRequest>
) => {
  return {
    ...state,
    clusterName: action.clusterName,
    sourceClusterNamespaces: [],
    isFetchingNamespaceList: true,
  };
};
export const namespaceFetchSuccess: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.namespaceFetchSuccess>
) => {
  return {
    ...state,
    sourceClusterNamespaces: action.sourceClusterNamespaces,
    isFetchingNamespaceList: false,
  };
};
export const namespaceFetchFailure: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.namespaceFetchFailure>
) => {
  return {
    ...state,
    sourceClusterNamespaces: [],
    isFetchingNamespaceList: false,
  };
};

export const updatePlanList: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.updatePlanList>
) => {
  const updatedPlanList = state.migPlanList.map((p: IPlan) => {
    if (p.MigPlan.metadata.name === action.updatedPlan.metadata.name) {
      return {
        MigPlan: action.updatedPlan,
        Migrations: [],
      } as IPlan;
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

export const updatePlanMigrations: PlanReducerFn = (state = INITIAL_STATE, action) => {
  // TODO: add migplan and migmigration typing
  const updatedPlanList = state.migPlanList.map((p: IPlan) => {
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

export const updatePlans: PlanReducerFn = (state = INITIAL_STATE, action) => {
  const updatedPlanList = action.updatedPlans.map((p) => {
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

export const initStage: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.initStage>
) => {
  const updatedPlan = state.migPlanList.find((p) => p.MigPlan.metadata.name === action.planName);
  const filteredPlans = state.migPlanList.filter(
    (p) => p.MigPlan.metadata.name !== action.planName
  );

  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
  };
};

export const initMigration: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.initMigration>
) => {
  const updatedPlan = state.migPlanList.find((p) => p.MigPlan.metadata.name === action.planName);
  const filteredPlans = state.migPlanList.filter(
    (p) => p.MigPlan.metadata.name !== action.planName
  );

  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
  };
};
export const stagingSuccess: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.stagingSuccess>
) => {
  const updatedPlan = state.migPlanList.find((p) => p.MigPlan.metadata.name === action.planName);
  const filteredPlans = state.migPlanList.filter(
    (p) => p.MigPlan.metadata.name !== action.planName
  );

  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
  };
};
export const stagingFailure: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.stagingFailure>
) => {
  return { ...state };
};

export const migrationSuccess: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.migrationSuccess>
) => {
  const updatedPlan = state.migPlanList.find((p) => p.MigPlan.metadata.name === action.planName);
  const filteredPlans = state.migPlanList.filter(
    (p) => p.MigPlan.metadata.name !== action.planName
  );

  const updatedPlansList = [...filteredPlans, updatedPlan];
  const sortedPlans = sortPlans(updatedPlansList);

  return {
    ...state,
    migPlanList: sortedPlans,
  };
};
export const migrationFailure: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.migrationFailure>
) => {
  return { ...state };
};

export const planStatusPollStart: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.startPlanStatusPolling>
) => {
  return { ...state, isPollingStatus: true };
};

export const planStatusPollStop: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.stopPlanStatusPolling>
) => {
  return { ...state, isPollingStatus: false };
};

export const getPVResourcesRequest: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.getPVResourcesRequest>
) => {
  return { ...state, isFetchingPVResources: true };
};

export const getPVResourcesSuccess: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.getPVResourcesSuccess>
) => {
  return { ...state, isFetchingPVResources: false, pvResourceList: action.pvResources };
};

export const getPVResourcesFailure: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.getPVResourcesFailure>
) => {
  return { ...state, isFetchingPVResources: false };
};

export const startPlanPolling: PlanReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isPolling: true,
  };
};

export const stopPlanPolling: PlanReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    isPolling: false,
  };
};

export const resetCurrentPlan: PlanReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    currentPlan: null,
    sourceClusterNamespaces: [],
  };
};

export const setCurrentPlan: PlanReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    currentPlan: action.currentPlan,
  };
};

export const updateCurrentPlanStatus: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.updateCurrentPlanStatus>
) => {
  return {
    ...state,
    currentPlanStatus: action.currentPlanStatus,
  };
};

const lockPlan: PlanReducerFn = (state = INITIAL_STATE, planName: string) => {
  let updatedLockedPlans = state.lockedPlanList;
  if (state.lockedPlanList.indexOf(planName) === -1) {
    updatedLockedPlans = [...updatedLockedPlans, planName];
  }
  return { ...state, lockedPlanList: updatedLockedPlans };
};

const unlockPlan: PlanReducerFn = (state = INITIAL_STATE, planName: string) => {
  const filteredLockedPlans = state.lockedPlanList.filter(
    (lockedPlanName) => lockedPlanName !== planName
  );
  return {
    ...state,
    lockedPlanList: filteredLockedPlans,
  };
};

export const planCloseAndDeleteRequest: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.planCloseAndDeleteRequest>
) => {
  return lockPlan(state, action.planName);
};

export const planCloseAndDeleteSuccess: PlanReducerFn = (state = INITIAL_STATE, action) => {
  state = unlockPlan(state, action.planName);

  return {
    ...state,
    migPlanList: state.migPlanList.filter((p) => p.MigPlan.metadata.name !== action.planName),
  };
};

export const planCloseAndDeleteFailure: PlanReducerFn = (state = INITIAL_STATE, action) => {
  return unlockPlan(state, action.planName);
};

/* 
Hook Reducers
*/

export const removeHookRequest: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.removeHookRequest>
) => {
  return {
    ...state,
    hookAddEditStatus: fetchingAddEditStatus(),
    isFetchingHookList: true,
  };
};

export const removeHookSuccess: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.removeHookSuccess>
) => {
  return {
    ...state,
    isFetchingHookList: false,
  };
};

export const removeHookFailure: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.removeHookFailure>
) => {
  return {
    ...state,
    isFetchingHookList: false,
  };
};

export const addHookRequest: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.addHookRequest>
) => {
  return {
    ...state,
    hookAddEditStatus: fetchingAddEditStatus(),
    isFetchingHookList: true,
  };
};

export const addHookSuccess: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.addHookSuccess>
) => {
  return {
    ...state,
    isFetchingHookList: false,
  };
};

export const addHookFailure: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.addHookFailure>
) => {
  return {
    ...state,
    isFetchingHookList: false,
  };
};

export const hookFetchRequest: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.hookFetchRequest>
) => {
  return {
    ...state,
    migHookList: [],
    isFetchingHookList: true,
  };
};
export const hookFetchSuccess: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.hookFetchSuccess>
) => {
  return {
    ...state,
    migHookList: action.migHookList,
    isFetchingHookList: false,
  };
};
export const hookFetchFailure: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.hookFetchFailure>
) => {
  return {
    ...state,
    migHookList: [],
    isFetchingHookList: false,
  };
};

export const setHookAddEditStatus: PlanReducerFn = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    hookAddEditStatus: action.status,
  };
};

export const updateHookRequest: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.updateHookRequest>
) => {
  return {
    ...state,
    hookAddEditStatus: fetchingAddEditStatus(),
    isFetchingHookList: true,
  };
};
export const updateHookSuccess: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.updateHookSuccess>
) => {
  return {
    ...state,
    isFetchingHookList: false,
  };
};

export const updateHookFailure: PlanReducerFn = (
  state = INITIAL_STATE,
  action: ReturnType<typeof PlanActions.updateHookSuccess>
) => {
  return {
    ...state,
    isFetchingHookList: false,
  };
};

const planReducer: PlanReducerFn = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case PlanActionTypes.ADD_PLAN_REQUEST:
      return addPlanRequest(state, action);
    case PlanActionTypes.INIT_STAGE:
      return initStage(state, action);
    case PlanActionTypes.INIT_MIGRATION:
      return initMigration(state, action);
    case PlanActionTypes.MIG_PLAN_FETCH_REQUEST:
      return migPlanFetchRequest(state, action);
    case PlanActionTypes.MIG_PLAN_FETCH_SUCCESS:
      return migPlanFetchSuccess(state, action);
    case PlanActionTypes.MIG_PLAN_FETCH_FAILURE:
      return migPlanFetchFailure(state, action);
    case PlanActionTypes.NAMESPACE_FETCH_REQUEST:
      return namespaceFetchRequest(state, action);
    case PlanActionTypes.NAMESPACE_FETCH_SUCCESS:
      return namespaceFetchSuccess(state, action);
    case PlanActionTypes.NAMESPACE_FETCH_FAILURE:
      return namespaceFetchFailure(state, action);
    case PlanActionTypes.ADD_PLAN_SUCCESS:
      return addPlanSuccess(state, action);
    case PlanActionTypes.ADD_PLAN_FAILURE:
      return addPlanFailure(state, action);
    case PlanActionTypes.REMOVE_PLAN_SUCCESS:
      return removePlanSuccess(state, action);
    case PlanActionTypes.STAGING_SUCCESS:
      return stagingSuccess(state, action);
    case PlanActionTypes.STAGING_FAILURE:
      return stagingFailure(state, action);
    case PlanActionTypes.MIGRATION_SUCCESS:
      return migrationSuccess(state, action);
    case PlanActionTypes.MIGRATION_FAILURE:
      return migrationFailure(state, action);
    case PlanActionTypes.UPDATE_PLAN_LIST:
      return updatePlanList(state, action);
    case PlanActionTypes.UPDATE_CURRENT_PLAN_STATUS:
      return updateCurrentPlanStatus(state, action);
    case PlanActionTypes.UPDATE_PLAN_MIGRATIONS:
      return updatePlanMigrations(state, action);
    case PlanActionTypes.UPDATE_PLANS:
      return updatePlans(state, action);
    case PlanActionTypes.PLAN_STATUS_POLL_START:
      return planStatusPollStart(state, action);
    case PlanActionTypes.PLAN_STATUS_POLL_STOP:
      return planStatusPollStop(state, action);
    case PlanActionTypes.GET_PV_RESOURCES_REQUEST:
      return getPVResourcesRequest(state, action);
    case PlanActionTypes.GET_PV_RESOURCES_SUCCESS:
      return getPVResourcesSuccess(state, action);
    case PlanActionTypes.GET_PV_RESOURCES_FAILURE:
      return getPVResourcesFailure(state, action);
    case PlanActionTypes.PLAN_POLL_START:
      return startPlanPolling(state, action);
    case PlanActionTypes.PLAN_POLL_STOP:
      return stopPlanPolling(state, action);
    case PlanActionTypes.RESET_CURRENT_PLAN:
      return resetCurrentPlan(state, action);
    case PlanActionTypes.SET_CURRENT_PLAN:
      return setCurrentPlan(state, action);
    case PlanActionTypes.PLAN_CLOSE_AND_DELETE_REQUEST:
      return planCloseAndDeleteRequest(state, action);
    case PlanActionTypes.PLAN_CLOSE_AND_DELETE_SUCCESS:
      return planCloseAndDeleteSuccess(state, action);
    case PlanActionTypes.PLAN_CLOSE_AND_DELETE_FAILURE:
      return planCloseAndDeleteFailure(state, action);
    case PlanActionTypes.HOOK_FETCH_REQUEST:
      return hookFetchRequest(state, action);
    case PlanActionTypes.HOOK_FETCH_SUCCESS:
      return hookFetchSuccess(state, action);
    case PlanActionTypes.HOOK_FETCH_FAILURE:
      return hookFetchFailure(state, action);
    case PlanActionTypes.REMOVE_HOOK_REQUEST:
      return removeHookRequest(state, action);
    case PlanActionTypes.REMOVE_HOOK_FAILURE:
      return removeHookFailure(state, action);
    case PlanActionTypes.REMOVE_HOOK_SUCCESS:
      return removeHookSuccess(state, action);
    case PlanActionTypes.SET_HOOK_ADD_EDIT_STATUS:
      return setHookAddEditStatus(state, action);
    case PlanActionTypes.UPDATE_HOOK_REQUEST:
      return updateHookRequest(state, action);
    case PlanActionTypes.UPDATE_HOOK_SUCCESS:
      return updateHookSuccess(state, action);
    case PlanActionTypes.UPDATE_HOOK_FAILURE:
      return updateHookFailure(state, action);
    case PlanActionTypes.ADD_HOOK_REQUEST:
      return addHookRequest(state, action);
    case PlanActionTypes.ADD_HOOK_SUCCESS:
      return addHookSuccess(state, action);
    case PlanActionTypes.ADD_HOOK_FAILURE:
      return addHookFailure(state, action);

    default:
      return state;
  }
};

export default planReducer;
