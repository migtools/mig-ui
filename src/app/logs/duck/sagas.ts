import { select, call, put, take, takeEvery } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { flatten } from 'lodash';
import { LogActions, LogActionTypes } from './actions';
import Q from 'q';
import { IDiscoveryClient } from '../../../client/discoveryClient';
import { PlanPodReportDiscovery } from '../../../client/resources/discovery';
import { IPlanReport, IPodLogSource, IPlanLogSources } from '../../../client/resources/convension';
import JSZip from 'jszip';
import utils from '../../common/duck/utils';
import { handleCertError } from './utils';
import { AlertActions } from '../../common/duck/actions';

function* downloadLog(action) {
  const state = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const logPath: string = action.logPath;
  try {
    const archive = new JSZip();
    const log = yield discoveryClient.getRaw(logPath);
    archive.file('log.txt', log.data.join('\n'));
    const content = yield archive.generateAsync({ type: 'blob' });
    const file = yield new Blob([content], { type: 'application/zip' });
    const url = yield URL.createObjectURL(file);
    yield put(LogActions.createLogArchive(url));
  } catch (err) {
    yield put(AlertActions.alertErrorTimeout(err.message));
  }
}

function* downloadLogs(action) {
  const state = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const report: IPlanLogSources = action.report;

}

function* extractLogs(action) {
  const state = yield select();
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
    yield put(AlertActions.alertErrorTimeout(err.message));
    yield put(LogActions.logsFetchFailure(err));
  }
}

function* collectReport(action) {
  const { planName } = action;
  const state = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const planPodReportDiscovery = new PlanPodReportDiscovery(planName);
  try {
    const planReport: IPlanReport = yield planPodReportDiscovery.get(discoveryClient);

    delete planReport.name;
    delete planReport.namespace;
    yield put(LogActions.reportFetchSuccess(planReport));

  } catch (err) {
    if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}`;
      yield handleCertError(failedUrl);
      return;
    }
    yield put(AlertActions.alertErrorTimeout(err.message));
    yield put(LogActions.reportFetchFailure(err));
  }
}

function* watchLogsPolling() {
  yield takeEvery(LogActionTypes.LOGS_FETCH_REQUEST, extractLogs);
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
