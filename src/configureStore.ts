import { history } from './helpers';
import { createLogger } from 'redux-logger';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { getDefaultMiddleware } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import { routerMiddleware } from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer, { IAuthReducerState } from './app/auth/duck';
import clusterReducer, { IClusterReducerState } from './app/cluster/duck';
import commonReducer from './app/common/duck';
import debugReducer, { IDebugReducerState } from './app/debug/duck';
import logReducer from './app/logs/duck';
import planReducer, { IPlanReducerState } from './app/plan/duck';
import storageReducer, { IStorageReducerState } from './app/storage/duck';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

const logger = createLogger({ collapsed: true });
const persistConfig = {
  key: 'root',
  storage,
  //whitelist: ['cluster', 'storage', 'plan'],
  whitelist: [],
};
export const rootReducer = combineReducers({
  router: connectRouter(history),
  auth: authReducer,
  common: commonReducer,
  debug: debugReducer,
  cluster: clusterReducer,
  storage: storageReducer,
  plan: planReducer,
  logs: logReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
  reducer: persistedReducer,
  middleware: [
    logger,
    sagaMiddleware,
    routerMiddleware(history),
    // ...getDefaultMiddleware({
    //   serializableCheck: {
    //     ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    //   },
    // }),
  ],
  devTools: process.env.NODE_ENV !== 'production',
});

const createdStore = () => {
  sagaMiddleware.run(rootSaga);
  return { store, persistor: persistStore(store) };
};
// Inferred types
export type DefaultRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default createdStore;
