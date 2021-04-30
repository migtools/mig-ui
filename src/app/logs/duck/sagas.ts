import { select, call, put, take, takeEvery, all } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { flatten } from 'lodash';
import { LogActions, LogActionTypes } from './actions';
import { IDiscoveryClient } from '../../../client/discoveryClient';
import {
  PlanPodReportDiscovery,
  ClusterKind,
  IPlanLogSources,
  IPlanReport,
} from '../../../client/resources/discovery';
import JSZip from 'jszip';
import utils from '../../common/duck/utils';
import { handleCertError } from './utils';
import { AlertActions } from '../../common/duck/actions';
import { IReduxState } from '../../../reducers';
import { alertErrorTimeout } from '../../common/duck/slice';

const clusterIndex = 4;
const logIndex = 8;

function* downloadLog(action) {
  const state: IReduxState = yield select();
  //NATODO: add cluster name to request
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const logPath: string = action.logPath;
  try {
    const archive = new JSZip();
    const log = yield discoveryClient.getRaw(logPath);
    const fullPath = logPath.split(/\//);
    const clusterName = fullPath[clusterIndex];
    const logName = fullPath[logIndex];
    const containerName = logPath.split(/container=/)[1];
    archive.file(`${clusterName}-${logName}-${containerName}.log`, log.data.join('\n'));
    const content = yield archive.generateAsync({ type: 'blob' });
    const file = new Blob([content], { type: 'application/zip' });
    const url = URL.createObjectURL(file);
    yield put(LogActions.createLogArchive(url));
  } catch (err) {
    yield put(alertErrorTimeout(err.message));
  }
}

function* downloadLogs(action) {
  const state: IReduxState = yield select();
  //NATODO: add cluster name to request
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const report: IPlanLogSources = action.report;
  try {
    const archive = new JSZip();
    let logPaths = flatten(
      Object.values(ClusterKind).map((src) =>
        report[src].map((pod) => pod.containers.map((container) => container.log))
      )
    );
    logPaths = flatten(logPaths.filter((log) => log.length > 0));
    const logs = yield all(logPaths.map((log) => discoveryClient.getRaw(log)));

    logs.map((log, index) => {
      const fullPath = logPaths[index].split(/\//);
      const clusterName = fullPath[clusterIndex];
      const logName = fullPath[logIndex];
      const containerName = logPaths[index].split(/container=/)[1];
      archive.file(`${clusterName}-${logName}-${containerName}.log`, log.data.join('\n'));
    });

    const content = yield archive.generateAsync({ type: 'blob' });
    const file = new Blob([content], { type: 'application/zip' });
    const url = URL.createObjectURL(file);
    yield put(LogActions.createLogArchive(url));
  } catch (err) {
    yield put(alertErrorTimeout(err.message));
  }
}

function* extractLogs(action) {
  const state: IReduxState = yield select();
  //NATODO: add cluster name to request
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const { logPath } = action;
  try {
    const log = yield discoveryClient.getRaw(logPath);
    yield put(LogActions.logsFetchSuccess(log.data));
  } catch (err) {
    if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}`;
      yield handleCertError(failedUrl);
      return;
    }
    yield put(alertErrorTimeout(err.message));
    yield put(LogActions.logsFetchFailure(err));
  }
}

function* collectReport(action) {
  const { planName } = action;
  const state: IReduxState = yield select();
  //NATODO: add cluster name to request
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const planPodReportDiscovery = new PlanPodReportDiscovery(planName);
  try {
    const planReport: IPlanReport = yield planPodReportDiscovery.get(discoveryClient);

    delete planReport.name;
    delete planReport.namespace;
    yield put(LogActions.reportFetchSuccess(planReport));
  } catch (err) {
    if (utils.isTimeoutError(err)) {
      yield put(alertErrorTimeout('Timed out while fetching plan report'));
    } else if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}`;
      yield handleCertError(failedUrl);
      return;
    }
    yield put(alertErrorTimeout(err.message));
    yield put(LogActions.reportFetchFailure(err));
  }
}

function* watchLogsPolling() {
  yield takeEvery(LogActionTypes.LOG_FETCH_REQUEST, extractLogs);
}

function* watchLogsDownload() {
  yield takeEvery(LogActionTypes.REQUEST_DOWNLOAD_ALL, downloadLogs);
}

function* watchLogDownload() {
  yield takeEvery(LogActionTypes.REQUEST_DOWNLOAD_LOG, downloadLog);
}

function* watchReportPolling() {
  yield takeEvery(LogActionTypes.REPORT_FETCH_REQUEST, collectReport);
}

export default {
  watchLogsDownload,
  watchLogDownload,
  watchLogsPolling,
  watchReportPolling,
};
