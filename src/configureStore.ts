import { history } from './helpers';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './reducers';
import { routerMiddleware } from 'connected-react-router';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
  }
}

const devMode = process.env.DEVMODE || 'local';

const persistConfig = {
  key: 'root',
  storage,
  //whitelist: ['cluster', 'storage', 'plan'],
  whitelist: [],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();

const enhancers = [];
const logger = createLogger({ collapsed: true });
const middleware = [thunk, logger, sagaMiddleware, routerMiddleware(history)];

if (devMode === 'local') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}
const composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers
);

const createdStore = () => {
  //TODO: remove any dependency on redux thunk. Added any type here to fix internal thunk type error
  // TS4082: Default export of the module has or is using private name '$CombinedState'.
  const store = createStore<any, any, any, any>(persistedReducer, composedEnhancers);
  sagaMiddleware.run(rootSaga);
  return { store, persistor: persistStore(store) };
};
export default createdStore;
