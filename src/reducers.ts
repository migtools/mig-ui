import { combineReducers } from 'redux';
import authReducer from './app/auth/duck';
import commonReducer from './app/common/duck';
import clusterReducer from './app/cluster/duck';
import storageReducer from './app/storage/duck';
import planReducer from './app/plan/duck';
import { migMetaReducer, IMigMeta } from './mig_meta';
import { connectRouter } from 'connected-react-router';
import { history } from './helpers';
import logReducer from './app/logs/duck';
import { IClusterReducerState } from './app/cluster/duck/reducers';
import { IStorageReducerState } from './app/storage/duck/reducers';
import { IPlanReducerState } from './app/plan/duck/reducers';

// TODO we should install @types/react-redux and improve the type safety of our Redux usage.
// https://redux.js.org/recipes/usage-with-typescript

export interface IReduxState {
  router: { [property: string]: any }; // TODO add types for router reducer state
  auth: { [property: string]: any }; // TODO add types for auth reducer state
  common: { [property: string]: any }; // TODO add types for common reducer state
  cluster: IClusterReducerState;
  storage: IStorageReducerState;
  plan: IPlanReducerState;
  logs: { [property: string]: any }; // TODO add types for logs reducer state
  migMeta: IMigMeta;
}

const rootReducer = combineReducers({
  router: connectRouter(history),
  auth: authReducer,
  common: commonReducer,
  cluster: clusterReducer,
  storage: storageReducer,
  plan: planReducer,
  logs: logReducer,
  migMeta: migMetaReducer,
});

export default rootReducer;
