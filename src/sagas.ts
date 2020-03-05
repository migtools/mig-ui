import { put, all, take } from 'redux-saga/effects';
import commonSagas from './app/common/duck/sagas';
import authSagas from './app/auth/duck/sagas';
import planSagas from './app/plan/duck/sagas';
import logSagas from './app/logs/duck/sagas';
import clusterSagas from './app/cluster/duck/sagas';
import storageSagas from './app/storage/duck/sagas';
import { initMigMeta } from './mig_meta';
import { AuthActions } from './app/auth/duck/actions';
import { setTokenExpiryHandler } from './client/client_factory';
import { push } from 'connected-react-router';

export default function* rootSaga() {

  function* appStarted() {
    // Some amount of meta data is delivered to the app by the server
    const migMeta = JSON.parse(atob(window['_mig_meta']));

    // Load the meta into the redux tree if it was found on the window
    // Will only be present in remote-dev and production scenarios where
    // oauth meta must be loaded
    if (migMeta) {
      yield put(initMigMeta(migMeta));
      yield put(AuthActions.initFromStorage());
    }

    // Configure token expiry behavior
    setTokenExpiryHandler(() => {
      const LS_KEY_CURRENT_USER = 'currentUser';
      localStorage.removeItem(LS_KEY_CURRENT_USER);
      push('/login?action=refresh');
    })
  }


  yield all([
    appStarted(),
    commonSagas.watchPlanPolling(),
    commonSagas.watchClustersPolling(),
    commonSagas.watchStoragePolling(),
    commonSagas.watchAlerts(),
    planSagas.watchStagePolling(),
    planSagas.watchMigrationPolling(),
    planSagas.watchAddPlanRequest(),
    planSagas.watchRunMigrationRequest(),
    planSagas.watchRunStageRequest(),
    planSagas.watchPlanUpdate(),
    planSagas.watchPlanUpdate(),
    planSagas.watchPlanCloseAndDelete(),
    planSagas.watchPlanClose(),
    planSagas.watchPlanStatus(),
    planSagas.watchGetPVResourcesRequest(),
    planSagas.watchNamespaceFetchRequest(),
    planSagas.watchPVUpdate(),
    logSagas.watchReportPolling(),
    logSagas.watchLogsPolling(),
    logSagas.watchLogDownload(),
    logSagas.watchLogsDownload(),
    clusterSagas.watchRemoveClusterRequest(),
    clusterSagas.watchAddClusterRequest(),
    clusterSagas.watchUpdateClusterRequest(),
    clusterSagas.watchClusterAddEditStatus(),
    storageSagas.watchRemoveStorageRequest(),
    storageSagas.watchAddStorageRequest(),
    storageSagas.watchStorageAddEditStatus(),
    storageSagas.watchUpdateStorageRequest(),
    authSagas.watchAuthEvents()
  ]);
}