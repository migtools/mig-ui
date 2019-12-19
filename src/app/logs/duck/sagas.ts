import { select, call, put, take, takeEvery } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { flatten } from 'lodash';
import { LogActions, LogActionTypes } from './actions';
import {
  MigResource,
  ExtendedCoreNamespacedResource,
  CoreNamespacedResourceKind,
  ExtendedCoreNamespacedResourceKind,
  CoreNamespacedResource,
  MigResourceKind
} from '../../../client/resources';
import { IMigPlan, IMigMigration } from '../../../client/resources/conversions';
import Q from 'q';
import { IDiscoveryClient } from '../../../client/discoveryClient';
import { PlanPodReportDiscovery } from '../../../client/resources/discovery';
import { IPlanReport } from '../../../client/resources/convension';
import utils from '../../common/duck/utils';

// export enum LogKind {
// velero = 'velero',
// restic = 'restic',
// controller = 'controller'
// }

// const ControllerPodLabel = 'control-plane=controller-manager';
// const VeleroPodLabel = 'component=velero';
// const ResticPodLabel = 'name=restic';

// function extractLogs(kind, pods, logAccum, client, namespace) {
//   return pods.map(veleroPod => {
//     const podName = veleroPod.metadata.name;
//     const veleroLog = client.get(
//       new ExtendedCoreNamespacedResource(
//         CoreNamespacedResourceKind.Pod,
//         namespace,
//         ExtendedCoreNamespacedResourceKind.Log),
//       podName
//     );
//     veleroLog.then(vl => logAccum[kind].push({
//       podName,
//       log: vl.data
//     }));
//     return veleroLog;
//   });
// }

function* extractLogs(action) {
  const state = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const { logPath } = action;
  try {
    const log = yield discoveryClient.getRaw(logPath);
    yield put(LogActions.logsFetchSuccess(log.data));
  } catch (err) {
    if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}/${logPath}`;
      utils.handleSelfSignedCertError(failedUrl, put);
      return;
    }
    console.error(err);
    yield put(LogActions.logsFetchFailure(err));
  }
}

// function* collectLogs(action) {
//   const { planName } = action;
//   const state = yield select();
//   const { migMeta } = state;
//   const hostClient: IClusterClient = ClientFactory.hostCluster(state, 'text');
//   try {
//     const planContainer = yield hostClient.get(new MigResource(MigResourceKind.MigPlan, migMeta.namespace), planName);
//     const migrationsContainer = yield hostClient.list(new MigResource(MigResourceKind.MigMigration, migMeta.namespace));
//     const migrations = migrationsContainer.data.items.reduce((accum, mig) => {
//       if (mig.spec.migPlanRef.name === planName) { accum.push(mig); }
//       return accum;
//     }, []);
//     const plan = planContainer.data;

//     const migClusters = yield hostClient.list(new MigResource(MigResourceKind.MigCluster, migMeta.namespace));
//     const hostCluster = migClusters.data.items.filter(migCluster => migCluster.spec.isHostCluster)[0];
//     const hostClusterName = hostCluster.metadata.name;
//     const sourceClusterName = plan.spec.srcMigClusterRef.name;
//     const targetClusterName = plan.spec.destMigClusterRef.name;
//     const planClusterNames = [sourceClusterName, targetClusterName];
//     const migrationLogs: IMigrationLogs = {
//       source: {
//         clusterName: sourceClusterName,
//         [LogKind.velero]: [],
//         [LogKind.restic]: [],
//       },
//       target: {
//         clusterName: targetClusterName,
//         [LogKind.velero]: [],
//         [LogKind.restic]: [],
//       },
//       host: {
//         clusterName: hostClusterName,
//         [LogKind.controller]: [],
//       },
//       plan,
//       migrations
//     };

//     const controllerPods = yield hostClient.list(
//       new CoreNamespacedResource(CoreNamespacedResourceKind.Pod, migMeta.namespace),
//       { labelSelector: ControllerPodLabel }
//     );

//     const controllerLogs = extractLogs(
//       LogKind.controller,
//       controllerPods.data.items,
//       migrationLogs[ClusterKind.host],
//       hostClient,
//       migMeta.namespace
//     );
//     yield Q.allSettled(controllerLogs);

//     const remoteClusters = migClusters.data.items.filter(
//       migCluster =>
//         !migCluster.spec.isHostCluster &&
//         planClusterNames.includes(migCluster.metadata.name))
//       .map(migCluster => migCluster.metadata.name)
//       .map(clusterName => ({
//         isSource: sourceClusterName === clusterName,
//         name: clusterName,
//         client: ClientFactory.forCluster(clusterName, state, 'text')
//       }));

//     // Append excluded host client
//     if (remoteClusters.length < 2) {
//       remoteClusters.push({
//         name: hostCluster.metadata.name,
//         client: hostClient
//       });
//     }

//     const migrationPods = yield remoteClusters.map(cluster => {
//       const veleroPods = cluster.client.list(
//         new CoreNamespacedResource(CoreNamespacedResourceKind.Pod, migMeta.namespace),
//         { labelSelector: VeleroPodLabel }
//       );
//       const resticPods = cluster.client.list(
//         new CoreNamespacedResource(CoreNamespacedResourceKind.Pod, migMeta.namespace),
//         { labelSelector: ResticPodLabel }
//       );
//       veleroPods.then(vp => cluster['velero'] = vp.data);
//       resticPods.then(rp => cluster['restic'] = rp.data);
//       return [veleroPods, resticPods];
//     });
//     yield Q.allSettled(flatten(migrationPods));

//     const logResults = yield remoteClusters.map(cluster => {
//       const clusterType = cluster.isSource ? 'source' : 'target';
//       const veleroLogs = extractLogs(
//         LogKind.velero,
//         cluster.velero.items,
//         migrationLogs[clusterType],
//         cluster.client,
//         migMeta.namespace
//       );

//       const resticLogs = extractLogs(
//         LogKind.restic,
//         cluster.restic.items,
//         migrationLogs[clusterType],
//         cluster.client,
//         migMeta.namespace
//       );
//       return veleroLogs.concat(resticLogs);
//     });
//     yield Q.allSettled(logResults);
//     yield put(LogActions.logsFetchSuccess(migrationLogs));
//   } catch (err) {
//     console.error(err);
//     yield put(LogActions.logsFetchFailure('Failed to get logs'));
//   }
// }

function* collectReport(action) {
  const { planName } = action;
  const state = yield select();
  const discoveryClient: IDiscoveryClient = ClientFactory.discovery(state);
  const planPodReportDiscovery = new PlanPodReportDiscovery(planName);
  try {
    const planReport: IPlanReport = yield planPodReportDiscovery.get(discoveryClient);

    // const logs: IPlanLogPods = {
    //   source: yield extractLogs(discoveryClient, planContainer.source, planPodReportDiscovery),
    //   destination: yield extractLogs(discoveryClient, planContainer.destination, planPodReportDiscovery),
    //   controller: yield extractLogs(discoveryClient, planContainer.controller, planPodReportDiscovery),
    // };

    // yield Q.allSettled(Object.values(logs));

    // console.error(logs);
    delete planReport.name;
    delete planReport.namespace;
    yield put(LogActions.reportFetchSuccess(planReport));

  } catch (err) {
    console.error(err);
    if (utils.isSelfSignedCertError(err)) {
      const failedUrl = `${discoveryClient.apiRoot()}/${planPodReportDiscovery.path()}`;
      utils.handleSelfSignedCertError(failedUrl, put);
      return;
    }
    console.error(err);
    yield put(LogActions.reportFetchFailure(err));
  }
}

function* watchLogsPolling() {
  yield takeEvery(LogActionTypes.LOGS_FETCH_REQUEST, extractLogs);
}

function* watchReportPolling() {
  yield takeEvery(LogActionTypes.REPORT_FETCH_REQUEST, collectReport);
}

export default {
  watchLogsPolling,
  watchReportPolling,
};
