import { history } from './helpers';
import { createLogger } from 'redux-logger';
import { configureStore } from '@reduxjs/toolkit';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './reducers';
import { routerMiddleware } from 'connected-react-router';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createSagaMiddleware from 'redux-saga';
import { getDefaultMiddleware } from '@reduxjs/toolkit';

import rootSaga from './sagas';
import commonReducer from './app/common/duck';
import authReducer from './app/auth/duck';
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
  }
}

const devMode = process.env.DEVMODE || 'local';

// const persistConfig = {
//   key: 'root',
//   storage,
//   //whitelist: ['cluster', 'storage', 'plan'],
//   whitelist: [],
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();

const enhancers = [];
const logger = createLogger({ collapsed: true });
// const middleware = [logger, sagaMiddleware, routerMiddleware(history)];
const middleware = [logger, sagaMiddleware];

if (devMode === 'local') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}
// const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);
//   const creadedStore = createStore<any, any, any, any>( composedEnhancers);

// const createdStore = () => {
//   sagaMiddleware.run(rootSaga);
//   return { store, persistor: persistStore(store) };
// };
// ...
const middlewareApplied = [middleware, ...getDefaultMiddleware()] as const;
const store = configureStore({
  rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
    }).concat(logger),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState,
  enhancers: [reduxBatch],
});
export default store;
