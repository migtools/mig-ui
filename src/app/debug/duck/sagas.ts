import { select, put, takeEvery } from 'redux-saga/effects';
import { IReduxState } from '../../../reducers';
import { DebugActionTypes, DebugActions } from './actions';
import { IPlan } from '../../plan/duck/types';
import { AlertActions } from '../../common/duck/actions';
import {
  ClientFactory,
  IDiscoveryClient,
  DebugTreeDiscoveryResource,
  IDiscoveryResource,
} from '@konveyor/lib-ui';

function* fetchDebugObject(action) {
  const state: IReduxState = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(
    state.auth.user,
    state.auth.migMeta.configNamespace,
    state.auth.migMeta.discoveryApi
  );
  try {
    const res = yield discoveryClient.getRaw(action.rawPath);
    yield put(DebugActions.debugObjectFetchSuccess(res.data));
  } catch (err) {
    yield put(DebugActions.debugObjectFetchFailure(err.message));
    yield put(AlertActions.alertErrorTimeout(`Failed to fetch debug tree: ${err.message}`));
  }
}

function* fetchDebugTree(action) {
  const planName: string = action.planName;
  const state: IReduxState = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(
    state.auth.user,
    state.auth.migMeta.namespace,
    state.auth.migMeta.discoveryApi
  );
  const debugTreeResource: IDiscoveryResource = new DebugTreeDiscoveryResource(planName);

  try {
    const res = yield discoveryClient.get(debugTreeResource);
    yield put(DebugActions.debugTreeFetchSuccess(res.data));
  } catch (err) {
    yield put(DebugActions.debugTreeFetchFailure(err.message));
    yield put(AlertActions.alertErrorTimeout(`Failed to fetch debug tree: ${err.message}`));
  }
}

function* watchDebugTreeFetchRequest() {
  yield takeEvery(DebugActionTypes.DEBUG_TREE_FETCH_REQUEST, fetchDebugTree);
}

function* watchDebugObjectFetchRequest() {
  yield takeEvery(DebugActionTypes.DEBUG_OBJECT_FETCH_REQUEST, fetchDebugObject);
}

export default {
  watchDebugTreeFetchRequest,
  watchDebugObjectFetchRequest,
};
