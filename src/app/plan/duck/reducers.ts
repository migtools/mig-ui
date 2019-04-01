import { Types } from './actions';
import { createReducer } from 'reduxsauce';
export const INITIAL_STATE = {
  isFetching: false,
  migrationPlanList: [],
  PlanSearchText: '',
};

export const migrationPlanFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, migrationPlanList: action.migrationPlanList };
};

export const addPlanSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migrationPlanList: [...state.migrationPlanList, action.newPlan],
  };
};
export const removePlanSuccess = (state = INITIAL_STATE, action) => {
  return { ...state };
};

export const HANDLERS = {
  [Types.MIGRATION_PLAN_FETCH_SUCCESS]: migrationPlanFetchSuccess,
  [Types.ADD_PLAN_SUCCESS]: addPlanSuccess,
  [Types.REMOVE_PLAN_SUCCESS]: removePlanSuccess,
};

export default createReducer(INITIAL_STATE, HANDLERS);
