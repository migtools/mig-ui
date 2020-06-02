import { combineReducers } from 'redux';
import authReducer from './app/auth/duck';
import commonReducer from './app/common/duck';
import clusterReducer from './app/cluster/duck';
import storageReducer from './app/storage/duck';
import planReducer from './app/plan/duck';
import { migMetaReducer } from './mig_meta';
import { connectRouter } from 'connected-react-router';
import { history } from './helpers';
import logReducer from './app/logs/duck';
import { IClusterReducerState } from './app/cluster/duck/reducers';
import { IStorageReducerState } from './app/storage/duck/reducers';

// TODO we should install @types/react-redux and improve the type safety of our Redux usage.
// https://redux.js.org/recipes/usage-with-typescript

export interface IReduxState {
  router: { [property: string]: any };
  auth: { [property: string]: any };
  common: { [property: string]: any };
  cluster: IClusterReducerState;
  storage: IStorageReducerState;
  plan: { [property: string]: any };
  logs: { [property: string]: any };
  migMeta: { [property: string]: any };
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
