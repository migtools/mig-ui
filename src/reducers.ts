import { combineReducers } from 'redux';
import homeReducer from './app/home/duck';
import authReducer from './app/auth/duck';
import commonReducer from './app/common/duck';
import { migMetaReducer } from './mig_meta';
import { connectRouter } from 'connected-react-router';
import { history } from './helpers';

const rootReducer = combineReducers({
  router: connectRouter(history),
  home: homeReducer,
  auth: authReducer,
  common: commonReducer,
  migMeta: migMetaReducer,
});

export default rootReducer;
