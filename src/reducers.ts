import { combineReducers } from 'redux';
import homeReducer from './app/home/duck';
import authReducer from './app/auth/duck';
import commonReducer from './app/common/duck';
import clusterReducer from './app/cluster/duck';
import storageReducer from './app/storage/duck';
import planReducer from './app/plan/duck';
import { migMetaReducer } from './mig_meta';
import { connectRouter } from 'connected-react-router';
import { history } from './helpers';

const rootReducer = combineReducers({
  router: connectRouter(history),
  home: homeReducer,
  auth: authReducer,
  common: commonReducer,
  cluster: clusterReducer,
  storage: storageReducer,
  plan: planReducer,
  migMeta: migMetaReducer,
});

export default rootReducer;
