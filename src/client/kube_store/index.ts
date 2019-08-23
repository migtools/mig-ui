import _ from 'lodash';
import { KubeResource } from '../resources';
import { MigResource, MigResourceKind } from '../resources/mig';

import mocked_data from './mocked_data';
import JsonMergePatch from 'json-merge-patch';

export const LocalStorageMockedDataKey = 'CAM_MOCKED_DATA';

export class KubeStore {
  private static instance: KubeStore;
  private clusterName: string;

  public constructor(clusterName) {
    this.clusterName = clusterName;
    this.ensureDataLoaded();
  }

  private _data() {
    // Returns the chunk of data relevant for mocking data from this k8s cluster
    // All subsequent calls will use this data to lookup their responses
    const d = JSON.parse(localStorage.getItem(LocalStorageMockedDataKey));
    if (! ('clusters' in d)) {
      alert('Unable to find expected mocked data for "clusters"');
      return {};
    }
    // Returning a new copy of data on each call to limit unintentional changes
    return {...d};
  }

  private data() {
    // Focused on returning just the data for 'clusterName'
    const d = this._data();
    if (! (this.clusterName in d['clusters'])) {
      alert('Unable to find expected mocked data for clusterName "' + this.clusterName + '"');
      return {};
    }
   return d['clusters'][this.clusterName]; 
  }

  private ensureDataLoaded() {
    let localData = JSON.parse(localStorage.getItem(LocalStorageMockedDataKey));
    if ((!localData) || (!localData.TIME_STAMP) || (localData.TIME_STAMP < mocked_data.TIME_STAMP)) {
      localStorage.setItem(LocalStorageMockedDataKey, JSON.stringify(mocked_data));
    }
    localData = JSON.parse(localStorage.getItem(LocalStorageMockedDataKey));
  }

  private setResourceStatus(apiKey, resourceName, obj, statusType, timeout=2000) {
    setTimeout(() => {
      if (!obj['status']) {
        obj['status'] = {};
      }
      obj['status']['conditions'] = [{
        lastTransitionTime: new Date().toUTCString(),
        type: statusType,
      }];
      if (this.data()[apiKey][resourceName]) {
        this.updateMockedData(apiKey, resourceName, obj);
      }
    }, timeout);
  }

  private discoverPVsMock = (apiKey, resourceName, migPlan) => {
    setTimeout(() => {
      const data = this._data();
      const sourceCluster = migPlan.spec.srcMigClusterRef.name;
      if (data.clusters[sourceCluster]['api/v1/persistentvolumes']) {
        const mockPVC = {
          accessModes: ['ReadWriteOnce'],
          name: 'sample-pvc',
          namespace: 'sample-namespace',
        };

        const mockSC = {
          action: 'copy',
          storageClass: 'gp2',
        };

        const mockSupported = {
          actions: ['copy', 'move'],
        };

        const pvKey = Object.keys(data.clusters[sourceCluster]['api/v1/persistentvolumes'])[0];
        const pv = data.clusters[sourceCluster]['api/v1/persistentvolumes'][pvKey];
        const mockPV = {
          capacity: pv.spec.capacity.storage,
          name: pvKey,
          pvc: mockPVC,
          selection: mockSC,
          supported: mockSupported,
        };
        migPlan.spec['persistentVolumes'] = [mockPV];
      }

      const mockPVDiscovery = {
        conditions: [{
          type: 'PvsDiscovered',
        }]
      };
      migPlan['status'] = mockPVDiscovery;
      this.updateMockedData(apiKey, resourceName, migPlan);
    }, 2000);
  };

  private setMigrationProgressPhase = (apiKey, resourceName, migMigration) => {
    let steps = [];
    if (migMigration.spec.stage) {
      steps = [
        'Prepare',
        'EnsureInitialBackup',
        'InitialBackupCreated',
        'AnnotateResources',
        'EnsureInitialBackupReplicated',
        'EnsureFinalRestore',
        'FinalRestoreCreated',
      ];
    } else {
      steps = [
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
    }
    steps.map((migrationPhase, step) => {
      setTimeout(() => {
        migMigration['status']['conditions'] = [{
          type: 'Running',
          reason: migrationPhase,
          message: `Step: ${step + 1}/${steps.length}`
        }];
        migMigration['status']['phase'] = migrationPhase;
        this.updateMockedData(apiKey, resourceName, migMigration);
      }, 3000 + step * 3000);
    });
  };

  private setMigrationSucceededConditionMock = (apiKey, resourceName, migMigration) => {
    let timeout;
    if (migMigration.spec.stage) {
      timeout = 25000;
    } else {
      timeout = 65000;
      setTimeout(() => {
        const planResource = new MigResource(MigResourceKind.MigPlan, migMigration.spec.migPlanRef.namespace);
        const closedPlan = this.getResource(
          new MigResource(MigResourceKind.MigPlan, migMigration.spec.migPlanRef.namespace),
          migMigration.spec.migPlanRef.name
        );
        closedPlan['spec']['closed'] = true;
        closedPlan['status']['conditions'] = [{
          lastTransitionTime: new Date().toUTCString(),
          type: 'Closed',
        }];
        this.updateMockedData(
          planResource.listPath().substr(1),
          migMigration.spec.migPlanRef.name,
          closedPlan);
      }, timeout + 3000);
    }
    setTimeout(() => {
      migMigration['status']['conditions'] = [{
        lastTransitionTime: new Date().toUTCString(),
        type: 'Succeeded',
      }];
      migMigration['status']['phase'] = 'Completed';
      this.updateMockedData(apiKey, resourceName, migMigration);
    }, timeout);

  };

  private setMigrationStarted = (apiKey, resourceName, migMigration) => {
    setTimeout(() => {
      migMigration['status'] = {};
      migMigration['status']['conditions'] = [];
      migMigration['status']['phase'] = 'Started';
      migMigration['status']['startTimestamp'] = new Date().toUTCString(),
      this.updateMockedData(apiKey, resourceName, migMigration);
    }, 2000);
  };

  private updateMockedData(apiKey, resourceName, updatedObject) {
    const newData = this._data();
    newData.clusters[this.clusterName][apiKey][resourceName] = updatedObject;
    localStorage.setItem(LocalStorageMockedDataKey, JSON.stringify(newData));
    if (['MigCluster', 'MigStorage'].includes(updatedObject.kind)) {
      this.setResourceStatus(apiKey, resourceName, updatedObject, 'Ready');
    }
  }

  private createMockedData(apiKey, resourceName, obj) {
    const newData = this._data();

    if (['MigCluster', 'MigStorage'].includes(obj.kind)) {
      this.setResourceStatus(apiKey, resourceName, obj, 'Ready');
    } else if (obj.kind === 'MigPlan') {
      if (!obj.spec.closed) {
        this.discoverPVsMock(apiKey, resourceName, obj);
        this.setResourceStatus(apiKey, resourceName, obj, 'Ready', 7000);
      } else {
        this.setResourceStatus(apiKey, resourceName, obj, 'Closed');
      }
    } else if (obj.kind === 'MigMigration') {
      this.setMigrationStarted(apiKey, resourceName, obj);
      this.setMigrationProgressPhase(apiKey, resourceName, obj);
      this.setMigrationSucceededConditionMock(apiKey, resourceName, obj);
    }
    const newObj = { [resourceName]: obj };
    newData.clusters[this.clusterName][apiKey] = {
      ...newData.clusters[this.clusterName][apiKey],
      ...newObj
    };
    localStorage.setItem(LocalStorageMockedDataKey, JSON.stringify(newData));
  }

  private deleteMockedData(apiKey, resourceName) {
    const newData = this._data();
    delete newData.clusters[this.clusterName][apiKey][resourceName];
    localStorage.setItem(LocalStorageMockedDataKey, JSON.stringify(newData));
  }

  public static Instance() {
    return this.instance || (this.instance = new this(''));
  }

  public patchResource(resource: KubeResource, name: string, patch: object): object {
    const apiKey = resource.listPath().substr(1);
    const mockedObject = { ...this.data()[apiKey][name] };
    const patchedReturn = JsonMergePatch.apply(mockedObject, patch);
    this.updateMockedData(apiKey, name, patchedReturn);
    return patchedReturn;
  }

  public setResource(resource: KubeResource, name: string, newObject: object): object {
    const apiKey = resource.listPath().substr(1);
    this.createMockedData(apiKey, name, newObject);
    return newObject;
  }

  public getResource(resource: KubeResource, name: string): object {
    const apiKey = resource.listPath().substr(1);
    const resourceObj = this.data()[apiKey][name];
    return resourceObj;
  }

  public listResource(resource: KubeResource): object {
    const apiKey = resource.listPath().substr(1);
    const resourceObjList = this.data()[apiKey];
    return Object.values(resourceObjList);
  }

  public deleteResource(resource: KubeResource, name: string): object {
    const apiKey = resource.listPath().substr(1);
    this.deleteMockedData(apiKey, name);
    return {};
  }
}
