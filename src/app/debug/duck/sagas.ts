import { select, put, takeEvery } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IDiscoveryClient } from '../../../client/discoveryClient';
import { IReduxState } from '../../../reducers';
import { DebugActionTypes, DebugActions } from './actions';
import { DebugTreeDiscoveryResource } from '../../../client/resources/discovery';
import { IPlan } from '../../plan/duck/types';
import { AlertActions } from '../../common/duck/actions';
import { IDiscoveryResource } from '../../../client/resources/common';

function* fetchDebugObject(action) {
  const state: IReduxState = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);

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
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
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
