import { race, call, delay, take, put } from 'redux-saga/effects';

import {
  startDataListPolling,
  stopDataListPolling,
  startStatusPolling,
  stopStatusPolling,
  startClusterPolling,
  stopClusterPolling,
  startStoragePolling,
  stopStoragePolling,
} from './actions';

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
    yield race([call(poll, action), take(stopClusterPolling().type)]);
  }
}

function* checkStatus(action) {
  const params = { ...action.params };
  while (true) {
    const generatorRes = yield call(params.asyncFetch);
    const pollingStatus = params.callback(
      generatorRes,
      params.type,
      params.statusItem,
      params.dispatch
    );

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

export default {
  watchStoragePolling,
  watchClustersPolling,
  watchDataListPolling,
  watchStatusPolling,
};
