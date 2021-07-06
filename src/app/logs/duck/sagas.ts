import { select, call, put, take, takeEvery, all } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { flatten } from 'lodash';
import { IDiscoveryClient } from '../../../client/discoveryClient';
import {
  PlanPodReportDiscovery,
  ClusterKind,
  IPlanLogSources,
  IPlanReport,
  ClusterPodReportDiscovery,
} from '../../../client/resources/discovery';
import JSZip from 'jszip';
import utils from '../../common/duck/utils';
import { handleCertError } from './utils';
import { alertErrorTimeout } from '../../common/duck/slice';
import { DefaultRootState } from '../../../configureStore';
import {
  IPodCollectorDiscoveryResource,
  PodCollectorDiscoveryResource,
} from '../../../client/resources/common';
import {
  clusterPodFetchFailure,
  clusterPodFetchRequest,
  clusterPodFetchSuccess,
  createLogArchive,
  logsFetchFailure,
  logsFetchRequest,
  logsFetchSuccess,
  reportFetchFailure,
  reportFetchRequest,
  reportFetchSuccess,
  requestDownloadAll,
  requestDownloadLog,
} from './slice';

const clusterIndex = 4;
const logIndex = 8;

function* downloadLog(action) {
  const state: DefaultRootState = yield select();
  //NATODO: add cluster name to request
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const logPath: string = action.payload;
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
    yield put(createLogArchive(url));
  } catch (err) {
    yield put(alertErrorTimeout(err.message));
  }
}

function* downloadLogs(action) {
  const state: DefaultRootState = yield select();
  //NATODO: add cluster name to request
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const report: IPlanLogSources = action.payload;
  try {
    const archive = new JSZip();
    let logPaths: any = flatten(
      Object.values(ClusterKind).map((src) =>
        report[src].map((pod) => pod.containers.map((container) => container.log))
      )
    );
    logPaths = flatten(logPaths.filter((log) => log.length > 0));
    const logs = yield all(logPaths.map((log: string) => discoveryClient.getRaw(log)));

    logs.map((log: any, index) => {
      const fullPath = logPaths[index].split(/\//);
      const clusterName = fullPath[clusterIndex];
      const logName = fullPath[logIndex];
      const containerName = logPaths[index].split(/container=/)[1];
      archive.file(`${clusterName}-${logName}-${containerName}.log`, log.data.join('\n'));
    });

    const content = yield archive.generateAsync({ type: 'blob' });
    const file = new Blob([content], { type: 'application/zip' });
    const url = URL.createObjectURL(file);
    yield put(createLogArchive(url));
  } catch (err) {
    yield put(alertErrorTimeout(err.message));
  }
}

function* extractLogs(action) {
  const state: DefaultRootState = yield select();
  //NATODO: add cluster name to request
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const logPath = action.payload;
  try {
    const log = yield discoveryClient.getRaw(logPath);
    yield put(logsFetchSuccess(log.data));
  } catch (err) {
    if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}`;
      yield handleCertError(failedUrl);
      return;
    }
    yield put(alertErrorTimeout(err.message));
    yield put(logsFetchFailure(err));
  }
}

function* collectReport(action) {
  const planName = action.payload;
  const state: DefaultRootState = yield select();
  //NATODO: add cluster name to request
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const planPodReportDiscovery = new PlanPodReportDiscovery(planName);
  try {
    const planReport: IPlanReport = yield planPodReportDiscovery.get(discoveryClient);

    delete planReport.name;
    delete planReport.namespace;
    yield put(reportFetchSuccess(planReport));
  } catch (err) {
    if (utils.isTimeoutError(err)) {
      yield put(alertErrorTimeout('Timed out while fetching plan report'));
    } else if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}`;
      yield handleCertError(failedUrl);
      return;
    }
    yield put(alertErrorTimeout(err.message));
    yield put(reportFetchFailure(err));
  }
}

function* fetchPodNames(action) {
  const clusterObjForPlan = action.payload;
  const state: DefaultRootState = yield select();
  //NATODO: add cluster name to request

  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);

  const srcPodCollectorDiscoveryResource: IPodCollectorDiscoveryResource =
    new PodCollectorDiscoveryResource(clusterObjForPlan.src);
  const destPodCollectorDiscoveryResource: IPodCollectorDiscoveryResource =
    new PodCollectorDiscoveryResource(clusterObjForPlan.dest);

  try {
    const srcPodList = yield discoveryClient.get(srcPodCollectorDiscoveryResource);
    const destPodList = yield discoveryClient.get(destPodCollectorDiscoveryResource);
    const srcLogPod = srcPodList?.data?.resources.find((resource) =>
      resource.name.includes('migration-log-reader-')
    );
    const destLogPod = destPodList?.data?.resources.find((resource) =>
      resource.name.includes('migration-log-reader-')
    );
    const logPodObject = {
      src: srcLogPod,
      dest: destLogPod,
    };
    yield put(clusterPodFetchSuccess(logPodObject));
  } catch (err) {
    if (utils.isTimeoutError(err)) {
      yield put(alertErrorTimeout('Timed out while fetching cluster pod report'));
    } else if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}`;
      yield handleCertError(failedUrl);
      return;
    }
    yield put(alertErrorTimeout(err.message));
    yield put(clusterPodFetchFailure(err));
  }
}

function* watchLogsPolling() {
  yield takeEvery(logsFetchRequest, extractLogs);
}

function* watchLogsDownload() {
  yield takeEvery(requestDownloadAll, downloadLogs);
}

function* watchLogDownload() {
  yield takeEvery(requestDownloadLog, downloadLog);
}

function* watchReportPolling() {
  yield takeEvery(reportFetchRequest, collectReport);
}

function* watchClusterPodFetchRequest() {
  yield takeEvery(clusterPodFetchRequest, fetchPodNames);
}

export default {
  watchLogsDownload,
  watchLogDownload,
  watchLogsPolling,
  watchReportPolling,
  watchClusterPodFetchRequest,
};
