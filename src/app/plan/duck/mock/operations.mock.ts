import { PlanActions } from '../actions';
import { ClientFactory } from '../../../../client/client_factory';
import { IClusterClient } from '../../../../client/client';
import { MigResource, MigResourceKind } from '../../../../client/resources';

import {
  createMigMigration,
} from '../../../../client/resources/conversions';
import {
  AlertActions
} from '../../../common/duck/actions';
import planUtils from '../utils';
import { PollingActions } from '../../../common/duck/actions';

import * as operations from '../operations';

const fetchPlans = operations.default.fetchPlans;
const fetchPlansGenerator = operations.default.fetchPlansGenerator;
const removePlan = operations.default.removePlan;
const fetchNamespacesForCluster = operations.default.fetchNamespacesForCluster;
const fetchMigMigrationsRefs = operations.default.fetchMigMigrationsRefs;

/* tslint:disable */
const uuidv1 = require('uuid/v1');
/* tslint:enable */
const pvFetchRequest = PlanActions.pvFetchRequest;

const PlanMigrationPollingInterval = 5000;

const setStageProgressPhase = (client, migMigration, migMeta) => {
  const steps = [
    'Prepare',
    'EnsureInitialBackup',
    'InitialBackupCreated',
    'AnnotateResources',
    'EnsureInitialBackupReplicated',
    'EnsureFinalRestore',
    'FinalRestoreCreated',
  ];
  steps.map((migrationPhase, step) => {
    setTimeout(() => {
      const mockCompletedStatus = {
        status: {
          conditions: [{
            type: 'Running',
            reason: migrationPhase,
            message: `Step: ${step + 1}/${steps.length}`
          }],
          phase: migrationPhase,
        }
      };

      return Promise.resolve(
        client.patch(
          new MigResource(MigResourceKind.MigMigration, migMeta.namespace),
          migMigration.metadata.name,
          mockCompletedStatus)
      );
    }, 3000 + step * 3000);
  });
};

const runStage = plan => {
  return async (dispatch, getState) => {
    try {
      dispatch(PlanActions.initStage(plan.MigPlan.metadata.name));
      dispatch(AlertActions.alertProgressTimeout('Staging Started'));
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const migMigrationObj = createMigMigration(
        uuidv1(),
        plan.MigPlan.metadata.name,
        migMeta.namespace,
        true,
        true
      );
      const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);
      setMigrationStartedConditionMock(client, migMigrationObj, migMeta);
      setStageProgressPhase(client, migMigrationObj, migMeta);
      setMigrationSucceededConditionMock(client, migMigrationObj, migMeta);

      //created migration response object
      const createMigRes = await client.create(migMigrationResource, migMigrationObj);
      const migrationListResponse = await client.list(migMigrationResource);
      const groupedPlan = planUtils.groupPlan(plan, migrationListResponse);

      const getStageStatusCondition = (pollingResponse, newObjectRes) => {
        const matchingPlan = pollingResponse.updatedPlans.find(
          p => p.MigPlan.metadata.name === newObjectRes.data.spec.migPlanRef.name
        );

        const migStatus = matchingPlan
          ? planUtils.getMigrationStatus(matchingPlan, newObjectRes)
          : null;
        if (migStatus.success) {
          dispatch(PlanActions.stagingSuccess(newObjectRes.data.spec.migPlanRef.name));
          dispatch(AlertActions.alertSuccessTimeout('Staging Successful'));
          return 'SUCCESS';
        } else if (migStatus.error) {
          dispatch(PlanActions.stagingFailure(migStatus.error));
          dispatch(AlertActions.alertErrorTimeout('Staging Failed'));
          return 'FAILURE';
        }
      };

      const params = {
        asyncFetch: fetchPlansGenerator,
        delay: PlanMigrationPollingInterval,
        callback: getStageStatusCondition,
        type: 'STAGE',
        statusItem: createMigRes,
        dispatch,
      };

      dispatch(PollingActions.startStatusPolling(params));
      dispatch(PlanActions.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(AlertActions.alertErrorTimeout(err));
      dispatch(PlanActions.stagingFailure(err));
    }
  };
};

const setMigrationSucceededConditionMock = (client, migMigration, migMeta) => {
  setTimeout(() => {
    const mockCompletedStatus = {
      status: {
        conditions: [{
          lastTransitionTime: new Date(),
          type: 'Succeeded',
        }],
        phase: 'Completed'
      }
    };

    return Promise.resolve(
      client.patch(
        new MigResource(MigResourceKind.MigMigration, migMeta.namespace),
        migMigration.metadata.name,
        mockCompletedStatus)
    );
  }, 30000);
};

const setMigrationStartedConditionMock = (client, migMigration, migMeta) => {
  setTimeout(() => {
    const mockCompletedStatus = {
      status: {
        conditions: [],
        phase: 'Started',
        startTimestamp: new Date(),
      }
    };

    return Promise.resolve(
      client.patch(
        new MigResource(MigResourceKind.MigMigration, migMeta.namespace),
        migMigration.metadata.name,
        mockCompletedStatus)
    );
  }, 2000);
};

const setMigrationProgressPhase = (client, migMigration, migMeta) => {
  const steps = [
    'Prepare',
    'EnsureInitialBackup',
    'InitialBackupCreated',
    'AnnotateResources',
    'EnsureStagePods',
    'StagePodsCreated',
    'RestartRestic',
    'ResticRestarted',
    'QuiesceApplications',
    'EnsureQuiesced',
    'EnsureStageBackup',
    'StageBackupCreated',
    'EnsureInitialBackupReplicated',
    'EnsureStageBackupReplicated',
    'EnsureStageRestore',
    'StageRestoreCreated',
    'EnsureFinalRestore',
    'FinalRestoreCreated',
    'EnsureStagePodsDeleted',
    'EnsureAnnotationsDeleted',
  ];
  steps.map((migrationPhase, step) => {
    setTimeout(() => {
      const mockCompletedStatus = {
        status: {
          conditions: [{
            type: 'Running',
            reason: migrationPhase,
            message: `Step: ${step + 1}/${steps.length}`
          }],
          phase: migrationPhase,
        }
      };

      return Promise.resolve(
        client.patch(
          new MigResource(MigResourceKind.MigMigration, migMeta.namespace),
          migMigration.metadata.name,
          mockCompletedStatus)
      );
    }, 3000 + step * 1000);
  });
};

const runMigration = (plan, disableQuiesce) => {
  return async (dispatch, getState) => {
    try {
      dispatch(PlanActions.initMigration(plan.MigPlan.metadata.name));
      dispatch(AlertActions.alertProgressTimeout('Migration Started'));
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());

      const migMigrationObj = createMigMigration(
        uuidv1(),
        plan.MigPlan.metadata.name,
        migMeta.namespace,
        false,
        disableQuiesce
      );
      const migMigrationResource = new MigResource(MigResourceKind.MigMigration, migMeta.namespace);

      //created migration response object
      const createMigRes = await client.create(migMigrationResource, migMigrationObj);
      setMigrationStartedConditionMock(client, migMigrationObj, migMeta);
      setMigrationProgressPhase(client, migMigrationObj, migMeta);
      setMigrationSucceededConditionMock(client, migMigrationObj, migMeta);

      const migrationListResponse = await client.list(migMigrationResource);
      const groupedPlan = planUtils.groupPlan(plan, migrationListResponse);

      const getMigrationStatusCondition = (pollingResponse, newObjectRes) => {
        const matchingPlan = pollingResponse.updatedPlans.find(
          p => p.MigPlan.metadata.name === newObjectRes.data.spec.migPlanRef.name
        );
        const migStatus = matchingPlan
          ? planUtils.getMigrationStatus(matchingPlan, newObjectRes)
          : null;
        if (migStatus.success) {
          dispatch(PlanActions.migrationSuccess(newObjectRes.data.spec.migPlanRef.name));
          dispatch(AlertActions.alertSuccessTimeout('Migration Successful'));
          return 'SUCCESS';
        } else if (migStatus.error) {
          dispatch(PlanActions.migrationFailure(migStatus.error));
          dispatch(AlertActions.alertErrorTimeout('Migration Failed'));
          return 'FAILURE';
        }
      };

      const params = {
        asyncFetch: fetchPlansGenerator,
        delay: PlanMigrationPollingInterval,
        callback: getMigrationStatusCondition,
        type: 'MIGRATION',
        statusItem: createMigRes,
        dispatch,
      };

      dispatch(PollingActions.startStatusPolling(params));
      dispatch(PlanActions.updatePlanMigrations(groupedPlan));
    } catch (err) {
      dispatch(AlertActions.alertErrorTimeout(err));
      dispatch(PlanActions.migrationFailure(err));
    }
  };
};

const discoverPVsMock = (client, migPlan, migMeta) => {
  setTimeout(() => {
    const mockPVC = {
      accessModes: ['ReadWriteOnce'],
      name: 'sample-pvc',
      namespace: migMeta.namespace,
    };

    const mockSC = {
      action: 'copy',
      storageClass: 'gp2',
    };

    const mockSupported = {
      actions: ['copy', 'move'],
    };

    const mockPV = {
      capacity: '100Gi',
      name: 'persistent-volume',
      pvc: mockPVC,
      selection: mockSC,
      supported: mockSupported,
    };

    const updateSpec = {
      spec: {
        persistentVolumes: [mockPV],
      }
    };

    const patchPlan = client.patch(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      migPlan.planName,
      updateSpec);

    const mockPVDiscovery = {
      status: {
        conditions: [{
          type: 'PvsDiscovered',
        }]
      }
    };
    const patchStatus = client.patch(
      new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
      migPlan.planName,
      mockPVDiscovery);

    return Promise.all([patchPlan, patchStatus]);
  }, 2000);
};

const setReadyConditionMock = (client, migPlan, migMeta) => {
  setTimeout(() => {
    const mockReadyStatus = {
      status: {
        conditions: [{
          lastTransitionTime: new Date(),
          type: 'Ready',
        }]
      }
    };
    return Promise.resolve(
      client.patch(
        new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
        migPlan.planName,
        mockReadyStatus)
    );
  }, 10000);
};

const addPlan = migPlan => {
  return async (dispatch, getState) => {
    try {
      dispatch(operations.default.addPlan(migPlan));
      // Wait for plan creation
      setTimeout(() => {
        const { migMeta } = getState();
        const client: IClusterClient = ClientFactory.hostCluster(getState());
        discoverPVsMock(client, migPlan, migMeta);
        setReadyConditionMock(client, migPlan, migMeta);
      }, 2000);
    } catch (err) {
      alert('Error while mocking plan creation');
    }
  };
};

export default {
  pvFetchRequest,
  fetchPlans,
  addPlan,
  removePlan,
  fetchNamespacesForCluster,
  runStage,
  runMigration,
  fetchMigMigrationsRefs,
  fetchPlansGenerator,
};
