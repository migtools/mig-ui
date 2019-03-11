import { authentication } from './authentication.reducer';
import { alert } from './alert.reducer';
import { connectRouter } from 'connected-react-router';
import { history } from '../helpers';

import { createStore, combineReducers } from 'redux';

const rootReducer = combineReducers({
  router: connectRouter(history),
  authentication,
  alert
});

export default rootReducer;
