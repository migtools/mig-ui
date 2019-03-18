// reducers.js
import Types from "./types";
import { createReducer } from "reduxsauce";
export const INITIAL_STATE = {
  isFetching: false,
  migrationClusterList: [],
  migrationPlanList: [],
  migrationStorageList: [],
};

export const migrationClusterFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, migrationClusterList: action.migrationClusterList };
};
// export const failure = (state = INITIAL_STATE, action) => {
//   return { ...state, alertMessage: action.message };
// };
// export const migrationPlanFetchsuccess = (state = INITIAL_STATE, action) => {
//   return { ...state, migrationPlanList: action.migrationPlanList };
// };
// export const failure = (state = INITIAL_STATE, action) => {
//   return { ...state, alertMessage: action.message };
// };
// export const migrationStorageFetchsuccess = (state = INITIAL_STATE, action) => {
//   return { ...state, migrationStorageList: action.migrationStorageList };
// };
// export const failure = (state = INITIAL_STATE, action) => {
//   return { ...state, alertMessage: action.message };
// };

// export const failure = (state = INITIAL_STATE, action) => {
//   return { ...state, alertMessage: action.message };
// };
// export const clear = (state = INITIAL_STATE, action) => {
//   return {};
// };

export const HANDLERS = {
  [Types.MIGRATION_CLUSTER_FETCH_SUCCESS]: migrationClusterFetchSuccess,
  // [Types.LOGOUT]: logout,
  // [Types.LOGIN_SUCCESS]: loginSuccess,
  // [Types.LOGIN_FAILURE]: loginFailure
};

export default createReducer(INITIAL_STATE, HANDLERS);
