import { Types } from './actions';
import { createReducer } from 'reduxsauce';
export const INITIAL_STATE = {
  isFetching: false,
  migPlanList: [],
  PlanSearchText: '',
};

export const migPlanFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, migPlanList: action.migPlanList };
};

export const addPlanSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migPlanList: [...state.migPlanList, action.newPlan],
  };
};
export const removePlanSuccess = (state = INITIAL_STATE, action) => {
  return { ...state };
};

export const HANDLERS = {
  [Types.MIG_PLAN_FETCH_SUCCESS]: migPlanFetchSuccess,
  [Types.ADD_PLAN_SUCCESS]: addPlanSuccess,
  [Types.REMOVE_PLAN_SUCCESS]: removePlanSuccess,
};

export default createReducer(INITIAL_STATE, HANDLERS);
