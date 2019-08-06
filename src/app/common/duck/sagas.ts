import { takeLatest, race, call, delay, take, put } from 'redux-saga/effects';

import {
  AlertActions,
  PollingActions
} from '../../common/duck/actions';

import { ClusterActions } from '../../cluster/duck/actions';
import { StorageActions } from '../../storage/duck/actions';

export const StatusPollingInterval = 4000;
const ErrorToastTimeout = 30; // Seconds

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
    const action = yield take(PollingActions.startDataListPolling().type);
    yield race([call(poll, action), take(PollingActions.stopDataListPolling().type)]);
  }
}

function* watchStoragePolling() {
  while (true) {
    const action = yield take(PollingActions.startStoragePolling().type);
    yield put(StorageActions.setIsPollingStorage(true));
    yield race([call(poll, action), take(PollingActions.stopStoragePolling().type)]);
    yield put(StorageActions.setIsPollingStorage(false));
  }
}

function* watchClustersPolling() {
  while (true) {
    const action = yield take(PollingActions.startClusterPolling().type);
    yield put(ClusterActions.setIsPollingCluster(true));
    yield race([call(poll, action), take(PollingActions.stopClusterPolling().type)]);
    yield put(ClusterActions.setIsPollingCluster(false));
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
        PollingActions.stopStatusPolling();

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
    const data = yield take(PollingActions.startStatusPolling().type);
    yield race([call(checkStatus, data), take('STOP_STATUS_POLLING')]);
  }
}

export function* progressTimeoutSaga(action) {
  try {
    yield put(AlertActions.alertProgress(action.params));
    yield delay(5000);
    yield put(AlertActions.alertClear());
  } catch (error) {
    put(AlertActions.alertClear());
  }
}

export function* errorTimeoutSaga(action) {
  try {
    yield put(AlertActions.alertError(action.params));
    yield delay(ErrorToastTimeout);
    yield put(AlertActions.alertClear());
  } catch (error) {
    put(AlertActions.alertClear());
  }
}

export function* successTimeoutSaga(action) {
  try {
    yield put(AlertActions.alertSuccess(action.params));
    yield delay(5000);
    yield put(AlertActions.alertClear());
  } catch (error) {
    yield put(AlertActions.alertClear());
  }
}

function* watchAlerts() {
  yield takeLatest(AlertActions.alertProgressTimeout().type, progressTimeoutSaga);
  yield takeLatest(AlertActions.alertErrorTimeout().type, errorTimeoutSaga);
  yield takeLatest(AlertActions.alertSuccessTimeout().type, successTimeoutSaga);
}
export default {
  watchStoragePolling,
  watchClustersPolling,
  watchDataListPolling,
  watchStatusPolling,
  watchAlerts,
};
