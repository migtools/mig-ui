import { takeLatest, race, call, delay, take, put } from 'redux-saga/effects';

import {
  startDataListPolling,
  stopDataListPolling,
  startStatusPolling,
  stopStatusPolling,
  startClusterPolling,
  stopClusterPolling,
  startStoragePolling,
  stopStoragePolling,
  alertProgressTimeout,
  alertSuccessTimeout,
  alertErrorTimeout,
  alertProgress,
  alertError,
  alertSuccess,
  alertClear,
} from './actions';

import { Creators as ClusterActionCreators } from '../../cluster/duck/actions';

export const StatusPollingInterval = 4000;

function* poll(action) {
  const params = { ...action.params };

  while (true) {
    try {
      const response = yield call(params.asyncFetch);
      const shouldContinue = params.callback(response);

      if (!shouldContinue) {
        throw new Error('Error while fetching data.');
      }
    } catch (e) {
      throw new Error(e);
    }
    yield delay(params.delay);
  }
}
function* watchDataListPolling() {
  while (true) {
    const action = yield take(startDataListPolling().type);
    yield race([call(poll, action), take(stopDataListPolling().type)]);
  }
}

function* watchStoragePolling() {
  while (true) {
    const action = yield take(startStoragePolling().type);
    yield race([call(poll, action), take(stopStoragePolling().type)]);
  }
}
function* watchClustersPolling() {
  while (true) {
    const action = yield take(startClusterPolling().type);
    yield put(ClusterActionCreators.setIsPollingCluster(true));
    yield race([call(poll, action), take(stopClusterPolling().type)]);
    yield put(ClusterActionCreators.setIsPollingCluster(false));
  }
}

function* checkStatus(action) {
  const params = { ...action.params };
  while (true) {
    const generatorRes = yield call(params.asyncFetch);
    const pollingStatus = params.callback(generatorRes, params.statusItem);

    switch (pollingStatus) {
      case 'SUCCESS':
        yield put({ type: 'STOP_STATUS_POLLING' });
        break;
      case 'FAILURE':
        stopStatusPolling();

        yield put({ type: 'STOP_STATUS_POLLING' });
        break;
      default:
        break;
    }
    yield delay(params.delay);
  }
}
function* watchStatusPolling() {
  while (true) {
    const data = yield take(startStatusPolling().type);
    yield race([call(checkStatus, data), take('STOP_STATUS_POLLING')]);
  }
}

export function* progressTimeoutSaga(action) {
  try {
    yield put(alertProgress(action.params));
    yield delay(5000);
    yield put(alertClear());
  } catch (error) {
    put(alertClear());
  }
}

export function* errorTimeoutSaga(action) {
  try {
    yield put(alertError(action.params));
    yield delay(5000);
    yield put(alertClear());
  } catch (error) {
    put(alertClear());
  }
}

export function* successTimeoutSaga(action) {
  try {
    yield put(alertSuccess(action.params));
    yield delay(5000);
    yield put(alertClear());
  } catch (error) {
    yield put(alertClear());
  }
}

function* watchAlerts() {
  yield takeLatest(alertProgressTimeout().type, progressTimeoutSaga);
  yield takeLatest(alertErrorTimeout().type, errorTimeoutSaga);
  yield takeLatest(alertSuccessTimeout().type, successTimeoutSaga);
}
export default {
  watchStoragePolling,
  watchClustersPolling,
  watchDataListPolling,
  watchStatusPolling,
  watchAlerts,
};
