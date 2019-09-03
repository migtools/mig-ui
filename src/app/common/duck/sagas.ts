import { takeLatest, race, call, delay, take, put } from 'redux-saga/effects';
import {
  AlertActions,
  PollingActions,
  PollingActionTypes,
  AlertActionTypes
} from '../../common/duck/actions';
import { PlanActionTypes } from '../../plan/duck/actions';
import { StorageActionTypes } from '../../storage/duck/actions';
import { ClusterActionTypes } from '../../cluster/duck/actions';

export const StatusPollingInterval = 4000;
const ErrorToastTimeout = 5000;

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
function* watchPlanPolling() {
  while (true) {
    const action = yield take(PlanActionTypes.PLAN_POLL_START);
    yield race([call(poll, action), take(PlanActionTypes.PLAN_POLL_STOP)]);
  }
}

function* watchStoragePolling() {
  while (true) {
    const action = yield take(StorageActionTypes.STORAGE_POLL_START);
    yield race([call(poll, action), take(StorageActionTypes.STORAGE_POLL_STOP)]);
  }
}

function* watchClustersPolling() {
  while (true) {
    const action = yield take(ClusterActionTypes.CLUSTER_POLL_START);
    yield race([call(poll, action), take(ClusterActionTypes.CLUSTER_POLL_STOP)]);
  }
}

function* checkStatus(action) {
  const params = { ...action.params };
  while (true) {
    const generatorRes = yield call(params.asyncFetch);
    const pollingStatus = params.callback(generatorRes, params.statusItem);

    switch (pollingStatus) {
      case 'SUCCESS':
        yield put(PollingActions.stopStatusPolling());
        break;
      case 'FAILURE':
        yield put(PollingActions.stopStatusPolling());
        break;
      default:
        break;
    }
    yield delay(params.delay);
  }
}
function* watchStatusPolling() {
  while (true) {
    const data = yield take(PollingActionTypes.STATUS_POLL_START);
    yield race([call(checkStatus, data), take(PollingActionTypes.STATUS_POLL_STOP)]);
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
  yield takeLatest(AlertActionTypes.ALERT_PROGRESS_TIMEOUT, progressTimeoutSaga);
  yield takeLatest(AlertActionTypes.ALERT_ERROR_TIMEOUT, errorTimeoutSaga);
  yield takeLatest(AlertActionTypes.ALERT_SUCCESS_TIMEOUT, successTimeoutSaga);
}

export default {
  watchStoragePolling,
  watchClustersPolling,
  watchPlanPolling,
  watchStatusPolling,
  watchAlerts,
};
