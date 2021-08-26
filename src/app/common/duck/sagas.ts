import { select, takeLatest, race, call, delay, take, put, StrictEffect } from 'redux-saga/effects';

import { PlanActionTypes, PlanActions } from '../../plan/duck/actions';
import { StorageActionTypes, StorageActions } from '../../storage/duck/actions';
import { ClusterActionTypes, ClusterActions } from '../../cluster/duck/actions';
import utils from '../../common/duck/utils';
import {
  alertClear,
  alertError,
  alertErrorModal,
  alertErrorTimeout,
  alertProgress,
  alertProgressTimeout,
  alertSuccess,
  alertSuccessTimeout,
  fetchCraneVersionFailure,
  fetchCraneVersionRequest,
  fetchCraneVersionSuccess,
  fetchMTCVersionFailure,
  fetchMTCVersionRequest,
  fetchMTCVersionSuccess,
} from './slice';
import { IAlertModalObj } from './types';
import { certErrorOccurred } from '../../auth/duck/slice';
import { DefaultRootState } from '../../../configureStore';
import { ClientFactory, IClusterClient } from '@konveyor/lib-ui';
import {
  CommonResource,
  CommonResourceKind,
  MigResource,
  MigResourceKind,
} from '../../../client/helpers';

function* getState(): Generator<StrictEffect, DefaultRootState, DefaultRootState> {
  const res: DefaultRootState = yield select();
  return res;
}

export const StatusPollingInterval = 4000;
const ErrorToastTimeout = 5000;

function* fetchCraneVersion(action: any): Generator<any, any, any> {
  const state = yield* getState();
  const client: IClusterClient = ClientFactory.cluster(state.auth.user, '/cluster-api');
  const { migMeta } = state.auth;

  const packageManifestResource = new CommonResource(
    CommonResourceKind.PackageManifest,
    'openshift-marketplace',
    'packages.operators.coreos.com',
    'v1'
  );

  const csvResource = new CommonResource(
    CommonResourceKind.ClusterServiceVersion,
    migMeta.namespace,
    'operators.coreos.com',
    'v1alpha1'
  );

  const routeResource = new CommonResource(
    CommonResourceKind.Route,
    'openshift-console',
    'route.openshift.io',
    'v1'
  );

  try {
    const routeResourceResponse = yield client.get(routeResource, 'console');
    const route = routeResourceResponse?.data.spec.host;
    const csvResourceResponse = yield client.get(csvResource, '');
    const packageManifestResourceResponse = yield client.get(
      packageManifestResource,
      'crane-operator'
    );
    const channels = packageManifestResourceResponse.data.status.channels.map(
      (channel: any) => channel?.currentCSV
    );
    yield put(
      fetchCraneVersionSuccess({
        currentVersion: csvResourceResponse.data?.items[0]?.metadata.name,
        versionList: channels,
        operatorType: 'crane',
        route: route,
      })
    );
  } catch (err) {
    yield put(fetchCraneVersionFailure(err));
  }
}
function* fetchMTCVersion(action: any): Generator<any, any, any> {
  const state = yield* getState();
  const client: IClusterClient = ClientFactory.cluster(state.auth.user, '/cluster-api');
  const { migMeta } = state.auth;

  const packageManifestResource = new CommonResource(
    CommonResourceKind.PackageManifest,
    'openshift-marketplace',
    'packages.operators.coreos.com',
    'v1'
  );

  const csvResource = new CommonResource(
    CommonResourceKind.ClusterServiceVersion,
    migMeta.namespace,
    'operators.coreos.com',
    'v1alpha1'
  );

  try {
    const routeResource = new CommonResource(
      CommonResourceKind.Route,
      'openshift-console',
      'route.openshift.io',
      'v1'
    );
    const routeResourceResponse = yield client.get(routeResource, 'console');
    const route = routeResourceResponse?.data.spec.host;

    const csvResourceResponse = yield client.get(csvResource, '');
    const packageManifestResourceResponse = yield client.get(
      packageManifestResource,
      'mtc-operator'
    );
    if (packageManifestResourceResponse.data.metadata.name === 'mtc-operator') {
      const channels = packageManifestResourceResponse.data.status.channels.map(
        (channel: any) => channel?.currentCSV
      );
      yield put(
        fetchMTCVersionSuccess({
          currentVersion: csvResourceResponse.data?.items[0]?.metadata.name,
          versionList: channels,
          operatorType: 'mtc',
          route,
        })
      );
    }
  } catch (err) {
    yield put(fetchCraneVersionRequest());
    yield put(fetchMTCVersionFailure(err));
  }
}

function* poll(action: any): Generator<any, any, any> {
  const params = { ...action.params };
  const state = yield* getState();

  while (true) {
    try {
      const response = yield call(params.asyncFetch);
      params.callback(response);
    } catch (err) {
      const migMeta = state.auth.migMeta;
      //handle selfSignedCert error & network connectivity error
      if (utils.isSelfSignedCertError(err)) {
        const oauthMetaUrl = `cluster-api/.well-known/oauth-authorization-server`;
        const alertModalObj: IAlertModalObj = {
          name: params.pollName,
          errorMessage: 'error',
        };
        if (state.common.errorModalObject === null) {
          yield put(alertErrorModal(alertModalObj));
          yield put(certErrorOccurred(oauthMetaUrl));
        }
      }
      //TODO: Handle "secrets not found error" & any other fetch errors here
    }
    yield delay(params.delay);
  }
}
function* watchPlanPolling(): Generator {
  while (true) {
    const action = yield take(PlanActionTypes.PLAN_POLL_START);
    yield race([call(poll, action), take(PlanActionTypes.PLAN_POLL_STOP)]);
  }
}

function* watchStoragePolling(): Generator {
  while (true) {
    const action = yield take(StorageActionTypes.STORAGE_POLL_START);
    yield race([call(poll, action), take(StorageActionTypes.STORAGE_POLL_STOP)]);
  }
}

function* watchClustersPolling(): Generator {
  while (true) {
    const action = yield take(ClusterActionTypes.CLUSTER_POLL_START);
    yield race([call(poll, action), take(ClusterActionTypes.CLUSTER_POLL_STOP)]);
  }
}

function* watchHookPolling(): Generator {
  while (true) {
    const action = yield take(PlanActionTypes.HOOK_POLL_START);
    yield race([call(poll, action), take(PlanActionTypes.HOOK_POLL_STOP)]);
  }
}

export function* progressTimeoutSaga(action: any) {
  try {
    yield put(alertProgress(action.payload));
    yield delay(5000);
    yield put(alertClear());
  } catch (error) {
    put(alertClear());
  }
}

export function* errorTimeoutSaga(action: any) {
  try {
    yield put(alertError(action.payload));
    yield delay(ErrorToastTimeout);
    yield put(alertClear());
  } catch (error) {
    put(alertClear());
  }
}

export function* successTimeoutSaga(action: any) {
  try {
    yield put(alertSuccess(action.payload));
    yield delay(5000);
    yield put(alertClear());
  } catch (error) {
    yield put(alertClear());
  }
}

function* watchAlerts() {
  yield takeLatest(alertProgressTimeout, progressTimeoutSaga);
  yield takeLatest(alertErrorTimeout, errorTimeoutSaga);
  yield takeLatest(alertSuccessTimeout, successTimeoutSaga);
}

function* watchCommonFetches() {
  yield takeLatest(fetchMTCVersionRequest, fetchMTCVersion);
  yield takeLatest(fetchCraneVersionRequest, fetchCraneVersion);
}

export default {
  watchStoragePolling,
  watchClustersPolling,
  watchPlanPolling,
  watchHookPolling,
  watchAlerts,
  watchCommonFetches,
};
