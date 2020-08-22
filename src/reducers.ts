import { combineReducers } from 'redux';
import authReducer, { IAuthReducerState } from './app/auth/duck';
import commonReducer from './app/common/duck';
import debugReducer, { IDebugReducerState } from './app/debug/duck';
import clusterReducer, { IClusterReducerState } from './app/cluster/duck';
import storageReducer, { IStorageReducerState } from './app/storage/duck';
import planReducer, { IPlanReducerState } from './app/plan/duck';
import tokenReducer, { ITokenReducerState } from './app/token/duck';
import { connectRouter } from 'connected-react-router';
import { history } from './helpers';
import logReducer from './app/logs/duck';

// TODO we should install @types/react-redux and improve the type safety of our Redux usage.
// https://redux.js.org/recipes/usage-with-typescript

export interface IReduxState {
  router: { [property: string]: any }; // TODO add types for router reducer state
  auth: IAuthReducerState;
  common: { [property: string]: any }; // TODO add types for common reducer state
  debug: IDebugReducerState;
  cluster: IClusterReducerState;
  storage: IStorageReducerState;
  plan: IPlanReducerState;
  token: ITokenReducerState;
  logs: { [property: string]: any }; // TODO add types for logs reducer state
}

const rootReducer = combineReducers({
  router: connectRouter(history),
  auth: authReducer,
  common: commonReducer,
  debug: debugReducer,
  cluster: clusterReducer,
  storage: storageReducer,
  plan: planReducer,
  token: tokenReducer,
  logs: logReducer,
});

export default rootReducer;
