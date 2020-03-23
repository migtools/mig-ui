import { select, takeLatest, race, call, delay, take, put } from 'redux-saga/effects';
import {
  AlertActions,
  PollingActions,
  PollingActionTypes,
  AlertActionTypes
} from '../../common/duck/actions';
import { AuthActions } from '../../auth/duck/actions';

import { PlanActionTypes, PlanActions } from '../../plan/duck/actions';
import { StorageActionTypes, StorageActions } from '../../storage/duck/actions';
import { ClusterActionTypes, ClusterActions } from '../../cluster/duck/actions';

export const StatusPollingInterval = 4000;
const ErrorToastTimeout = 5000;

function* poll(action) {
  const params = { ...action.params };

  while (true) {
    const response = yield call(params.asyncFetch);
    const shouldContinue = params.callback(response);

    if (!shouldContinue) {
      const state = yield select();
      const migMeta = state.migMeta;
      const oauthMetaUrl = `${migMeta.clusterApi}/.well-known/oauth-authorization-server`;

      // Handle cert refresh error & network connectivity error
      if (response.e.response.data.message === 'Network Error') {
        const alertModalObj = {
          name: params.pollName,
          errorMessage: 'error'
        };
        yield put(AlertActions.alertErrorModal(alertModalObj));
        yield put(AuthActions.certErrorOccurred(oauthMetaUrl));
        yield put(PlanActions.stopPlanPolling());
        yield put(ClusterActions.stopClusterPolling());
        yield put(StorageActions.stopStoragePolling());

      }

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
  watchAlerts,
};
