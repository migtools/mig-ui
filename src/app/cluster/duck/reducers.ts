import Types from './types';
import { createReducer } from 'reduxsauce';
export const INITIAL_STATE = {
  isFetching: false,
  migrationClusterList: [],
  clusterSearchText: '',
};

export const migrationClusterFetchSuccess = (state = INITIAL_STATE, action) => {
  return { ...state, migrationClusterList: action.migrationClusterList };
};

export const addClusterSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    migrationClusterList: [...state.migrationClusterList, action.newCluster],
  };
};
export const removeClusterSuccess = (state = INITIAL_STATE, action) => {
  return { ...state };
  // return state.migrationClusterList.filter(
  //   (item, index) => item.id !== action.id
  // );
};

export const HANDLERS = {
  [Types.MIGRATION_CLUSTER_FETCH_SUCCESS]: migrationClusterFetchSuccess,
  [Types.ADD_CLUSTER_SUCCESS]: addClusterSuccess,
  // [Types.ADD_CLUSTER_FAILURE]:addClusterfailure,
  [Types.REMOVE_CLUSTER_SUCCESS]: removeClusterSuccess,

  // [Types.LOGOUT]: logout,
  // [Types.LOGIN_SUCCESS]: loginSuccess,
  // [Types.LOGIN_FAILURE]: loginFailure
};

export default createReducer(INITIAL_STATE, HANDLERS);
