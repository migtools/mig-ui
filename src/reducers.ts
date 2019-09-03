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
