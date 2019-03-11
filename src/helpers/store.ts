import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'connected-react-router';
import rootReducer from '../reducers';
import history from './history'

const loggerMiddleware = createLogger();

export const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(
      routerMiddleware(history),
      thunkMiddleware,
      loggerMiddleware
    )
  )
);
