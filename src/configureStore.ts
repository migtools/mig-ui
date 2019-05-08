import { history } from './helpers';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './reducers';
import { routerMiddleware } from 'connected-react-router';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
declare global {
  /* tslint:disable */
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
  }
  /* tslint:enable */
}

const devMode = process.env.DEVMODE || 'local';

const persistConfig = {
  key: 'root',
  storage,
  //whitelist: ['cluster', 'storage', 'plan'],
  whitelist: [],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const enhancers = [];
const middleware = [thunk, logger, routerMiddleware(history)];

if (devMode === 'local') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}
const composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers,
);

export default () => {
  const store = createStore(persistedReducer, composedEnhancers);
  return { store, persistor: persistStore(store) };
};
