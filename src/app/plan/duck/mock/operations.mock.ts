import { ClientFactory } from '../../../../client/client_factory';
import { IClusterClient } from '../../../../client/client';
import { MigResource, MigResourceKind } from '../../../../client/resources';
import planUtils from '../utils';

import * as operations from '../operations';

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

      return client.patch(
          new MigResource(MigResourceKind.MigMigration, migMeta.namespace),
          migMigration.metadata.name,
          mockCompletedStatus);
    }, 3000 + step * 3000);
  });
};

const runStage = plan => {
  return async (dispatch, getState) => {
    try {
      // Start vanilla stage migration run
      dispatch(operations.default.runStage(plan));

      const state = getState();
      const { migMeta } = state;
      const client: IClusterClient = ClientFactory.hostCluster(state);
      const migMigrationObj = await searchAssociatedMigration(client, plan, migMeta);

      setMigrationStartedConditionMock(client, migMigrationObj, migMeta);
      setStageProgressPhase(client, migMigrationObj, migMeta);
      setMigrationSucceededConditionMock(client, migMigrationObj, migMeta);

    } catch (err) {
      alert('Error while running a mocked stage migration: ' + err.toString());
    }
  };
};

const setMigrationSucceededConditionMock = (client, migMigration, migMeta) => {
  setTimeout(() => {
    const mockCompletedStatus = {
      status: {
        conditions: [{
          lastTransitionTime: new Date().toUTCString(),
          type: 'Succeeded',
        }],
        phase: 'Completed'
      }
    };

    return client.patch(
        new MigResource(MigResourceKind.MigMigration, migMeta.namespace),
        migMigration.metadata.name,
        mockCompletedStatus);
  }, 30000);
};

const setMigrationStartedConditionMock = (client, migMigration, migMeta) => {
  setTimeout(() => {
    const mockCompletedStatus = {
      status: {
        conditions: [],
        phase: 'Started',
        startTimestamp: new Date().toUTCString(),
      }
    };

    return client.patch(
        new MigResource(MigResourceKind.MigMigration, migMeta.namespace),
        migMigration.metadata.name,
        mockCompletedStatus);
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

      return client.patch(
          new MigResource(MigResourceKind.MigMigration, migMeta.namespace),
          migMigration.metadata.name,
          mockCompletedStatus);
    }, 3000 + step * 1000);
  });
};

const searchAssociatedMigration = async (client, plan, migMeta) => {
  const migrationListResponse = await client.list(
    new MigResource(MigResourceKind.MigMigration, migMeta.namespace));
  const groupedPlan = planUtils.groupPlan(plan, migrationListResponse);
  // Initial migration resource has no status field
  return groupedPlan.Migrations.find((mig) => !mig.status);
};

const runMigration = (plan, disableQuiesce) => {
  return async (dispatch, getState) => {
    try {
      // Start vanilla migration run
      dispatch(operations.default.runMigration(plan, disableQuiesce));

      const state = getState();
      const { migMeta } = state;
      const client: IClusterClient = ClientFactory.hostCluster(state);
      const migMigrationObj = await searchAssociatedMigration(client, plan, migMeta);

      setMigrationStartedConditionMock(client, migMigrationObj, migMeta);
      setMigrationProgressPhase(client, migMigrationObj, migMeta);
      setMigrationSucceededConditionMock(client, migMigrationObj, migMeta);

    } catch (err) {
      alert('Error while running a mocked migration: ' + err.toString());
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
          lastTransitionTime: new Date().toUTCString(),
          type: 'Ready',
        }]
      }
    };
    return client.patch(
        new MigResource(MigResourceKind.MigPlan, migMeta.namespace),
        migPlan.planName,
        mockReadyStatus);
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
  pvFetchRequest: operations.default.pvFetchRequest,
  fetchPlans: operations.default.fetchPlans,
  addPlan,
  removePlan: operations.default.removePlan,
  fetchNamespacesForCluster: operations.default.fetchNamespacesForCluster,
  runStage,
  runMigration,
  fetchMigMigrationsRefs: operations.default.fetchMigMigrationsRefs,
  fetchPlansGenerator: operations.default.fetchPlansGenerator,
};
