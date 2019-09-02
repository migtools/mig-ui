import { takeEvery, takeLatest, select, retry, race, call, delay, put, take } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import {
  AlertActions,
} from '../../common/duck/actions';
import { LogActions, LogActionTypes } from './actions';
import planUtils from '../../plan/duck/utils';
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

export enum LogKind {
  velero = 'velero',
  restic = 'restic',
  controller = 'controller'
}

export enum ClusterKind {
  source = 'source',
  target = 'target',
  host = 'host',
}

export interface ILog {
  podName: string;
  log: string;
}

export type IMigrationClusterLogType = {
  [key in LogKind]?: ILog[];
};

export interface IMigrationClusterLog extends IMigrationClusterLogType {
  clusterName: string;
}

export type IMigrationClusterLogList = {
  [key in ClusterKind]: IMigrationClusterLog;
};

export interface IMigrationLogs extends IMigrationClusterLogList {
  plan: IMigPlan;
  migrations: IMigMigration[];
}

const ControllerPodLabel = 'control-plane=controller-manager';
const VeleroPodLabel = 'component=velero';
const ResticPodLabel = 'name=restic';

function extractLogs(kind, pods, logAccum, client, namespace) {
  return pods.map(veleroPod => {
    const podName = veleroPod.metadata.name;
    const veleroLog = client.get(
      new ExtendedCoreNamespacedResource(
        CoreNamespacedResourceKind.Pod,
        namespace,
        ExtendedCoreNamespacedResourceKind.Log),
      podName
    );
    veleroLog.then(vl => logAccum[kind].push({
      podName,
      log: vl.data
    }));
    return veleroLog;
  });
}

function* collectLogs(action) {
  const { planName } = action;
  const state = yield select();
  const { migMeta } = state;
  const hostClient: IClusterClient = ClientFactory.hostCluster(state, 'text');
  try {
    const planContainer = yield hostClient.get(new MigResource(MigResourceKind.MigPlan, migMeta.namespace), planName);
    const migrationsContainer = yield hostClient.list(new MigResource(MigResourceKind.MigMigration, migMeta.namespace));
    const migrations = migrationsContainer.data.items.reduce((accum, mig) => {
      if (mig.spec.migPlanRef.name === planName) { accum.push(mig); }
      return accum;
    }, []);
    const plan = planContainer.data;

    const migClusters = yield hostClient.list(new MigResource(MigResourceKind.MigCluster, migMeta.namespace));
    const hostCluster = migClusters.data.items.filter(migCluster => migCluster.spec.isHostCluster)[0];
    const hostClusterName = hostCluster.metadata.name;
    const sourceClusterName = plan.spec.srcMigClusterRef.name;
    const targetClusterName = plan.spec.destMigClusterRef.name;
    const planClusterNames = [sourceClusterName, targetClusterName];
    const migrationLogs: IMigrationLogs = {
      source: {
        clusterName: sourceClusterName,
        [LogKind.velero]: [],
        [LogKind.restic]: [],
      },
      target: {
        clusterName: targetClusterName,
        [LogKind.velero]: [],
        [LogKind.restic]: [],
      },
      host: {
        clusterName: hostClusterName,
        [LogKind.controller]: [],
      },
      plan,
      migrations
    };

    const controllerPods = yield hostClient.list(
      new CoreNamespacedResource(CoreNamespacedResourceKind.Pod, migMeta.namespace),
      { labelSelector: ControllerPodLabel }
    );

    const controllerLogs = extractLogs(
      LogKind.controller,
      controllerPods.data.items,
      migrationLogs[ClusterKind.host],
      hostClient,
      migMeta.namespace
    );
    yield Q.allSettled(controllerLogs);

    const remoteClusters = migClusters.data.items.filter(
      migCluster =>
        !migCluster.spec.isHostCluster &&
        planClusterNames.includes(migCluster.metadata.name))
      .map(migCluster => migCluster.metadata.name)
      .map(clusterName => ({
        isSource: sourceClusterName === clusterName,
        name: clusterName,
        client: ClientFactory.forCluster(clusterName, state, 'text')
      }));

    // Append excluded host client
    if (remoteClusters.length < 2) {
      remoteClusters.push({
        name: hostCluster.metadata.name,
        client: hostClient
      });
    }

    const migrationPods = yield remoteClusters.map(cluster => {
      const veleroPods = cluster.client.list(
        new CoreNamespacedResource(CoreNamespacedResourceKind.Pod, migMeta.namespace),
        { labelSelector: VeleroPodLabel }
      );
      const resticPods = cluster.client.list(
        new CoreNamespacedResource(CoreNamespacedResourceKind.Pod, migMeta.namespace),
        { labelSelector: ResticPodLabel }
      );
      veleroPods.then(vp => cluster['velero'] = vp.data);
      resticPods.then(rp => cluster['restic'] = rp.data);
      return [veleroPods, resticPods];
    });
    yield Q.allSettled(migrationPods.flat());

    const logResults = yield remoteClusters.map(cluster => {
      const clusterType = cluster.isSource ? 'source' : 'target';
      const veleroLogs = extractLogs(
        LogKind.velero,
        cluster.velero.items,
        migrationLogs[clusterType],
        cluster.client,
        migMeta.namespace
      );

      const resticLogs = extractLogs(
        LogKind.restic,
        cluster.restic.items,
        migrationLogs[clusterType],
        cluster.client,
        migMeta.namespace
      );
      return veleroLogs.concat(resticLogs);
    });
    yield Q.allSettled(logResults);
    yield put(LogActions.logsFetchSuccess(migrationLogs));
  } catch (err) {
    console.error(err);
    yield put(LogActions.logsFetchFailure('Failed to get logs'));
  }
}

function* watchLogsPolling() {
  while (true) {
    const action = yield take(LogActionTypes.LOGS_FETCH_REQUEST);
    yield call(collectLogs, action);
  }
}

export default {
  watchLogsPolling
};
