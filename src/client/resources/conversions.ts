import { pvStorageClassAssignmentKey } from '../../app/plan/components/Wizard/StorageClassTable';
import deepEqual from 'deep-equal';

export function createTokenSecret(name: string, namespace: string, rawToken: string) {
  // btoa => to base64, atob => from base64
  const encodedToken = btoa(rawToken);
  return {
    apiVersion: 'v1',
    data: {
      saToken: encodedToken,
    },
    kind: 'Secret',
    metadata: {
      name,
      namespace,
    },
    type: 'Opaque',
  };
}

export function patchTokenSecret(rawToken: string) {
  // btoa => to base64, atob => from base64
  const encodedToken = btoa(rawToken);
  return {
    data: {
      saToken: encodedToken,
    },
  };
}

export function tokenFromSecret(secret: any) {
  return atob(secret.data.token);
}

export function createMigCluster(
  name: string,
  namespace: string,
  clusterUrl: string,
  tokenSecret: any
) {
  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigCluster',
    metadata: {
      name,
      namespace,
    },
    spec: {
      isHostCluster: false,
      url: clusterUrl,
      serviceAccountSecretRef: {
        name: tokenSecret.metadata.name,
        namespace: tokenSecret.metadata.namespace,
      },
    },
  };
}

export function patchMigClusterUrl(
  clusterUrl: string,
) {
  return {
    spec: {
      url: clusterUrl,
    },
  };
}

export function createMigStorage(
  name: string,
  bucketName: string,
  bucketRegion: string,
  s3Url: string,
  namespace: string,
  tokenSecret: any
) {
  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigStorage',
    metadata: {
      name,
      namespace,
    },
    spec: {
      backupStorageProvider: 'aws',
      volumeSnapshotProvider: 'aws',
      backupStorageConfig: {
        awsBucketName: bucketName,
        awsRegion: bucketRegion,
        awsS3Url: s3Url,
        credsSecretRef: {
          name: tokenSecret.metadata.name,
          namespace: tokenSecret.metadata.namespace,
        },
      },
      volumeSnapshotConfig: {
        awsRegion: bucketRegion,
        credsSecretRef: {
          name: tokenSecret.metadata.name,
          namespace: tokenSecret.metadata.namespace,
        },
      },
    },
  };
}

export function patchMigStorage(
  bucketName: string,
  bucketRegion: string,
  s3Url: string,
) {
  return {
    spec: {
      backupStorageConfig: {
        awsBucketName: bucketName,
        awsRegion: bucketRegion,
        awsS3Url: s3Url,
      },
      volumeSnapshotConfig: {
        awsRegion: bucketRegion,
      },
    },
  };
}

export function createStorageSecret(
  name: string,
  namespace: string,
  secretKey: any,
  accessKey: string
) {
  // btoa => to base64, atob => from base64
  const encodedAccessKey = btoa(accessKey);
  const encodedSecretKey = btoa(secretKey);
  return {
    apiVersion: 'v1',
    data: {
      'aws-access-key-id': encodedAccessKey,
      'aws-secret-access-key': encodedSecretKey,
    },
    kind: 'Secret',
    metadata: {
      name,
      namespace,
    },
    type: 'Opaque',
  };
}

export function patchStorageSecret(secretKey: any, accessKey: string) {
  // btoa => to base64, atob => from base64
  const encodedAccessKey = btoa(accessKey);
  const encodedSecretKey = btoa(secretKey);
  return {
    data: {
      'aws-access-key-id': encodedAccessKey,
      'aws-secret-access-key': encodedSecretKey,
    },
  };
}

export function updatePlanNamespaces(migPlan: ReturnType<typeof createMigPlan>, planValues: any): boolean {
  if (!planValues.selectedNamespaces) {
    return false;
  }

  const updatedNamespaces = planValues.selectedNamespaces.map(ns => ns.metadata.name);
  if (deepEqual(migPlan.spec.namespaces, updatedNamespaces)) {
    return false;
  }

  migPlan.spec.namespaces = updatedNamespaces;
  return true;
}

export function updatePlanSourceCluster(migPlan: ReturnType<typeof createMigPlan>, planValues: any): boolean {
  if (!planValues.sourceCluster) {
    return false;
  }

  return true;
}

export function updatePlanDestinationCluster(migPlan: ReturnType<typeof createMigPlan>, planValues: any): boolean {
  if (!planValues.destinationCluster) {
    return false;
  }

  return true;
}

export function updatePlanStorage(migPlan: ReturnType<typeof createMigPlan>, planValues: any): boolean {
  if (!planValues.selectedStorage || migPlan.spec.migStorageRef.name === planValues.selectedStorage) {
    return false;
  }

  migPlan.spec.migStorageRef = {
    name: planValues.selectedStorage,
    namespace: migPlan.metadata.namespace,
  };

  return true;
}

export function updatePlanPersistentVolumes(migPlan: ReturnType<typeof createMigPlan>, planValues: any): boolean {
  if (!migPlan.spec.persistentVolumes || !planValues[pvStorageClassAssignmentKey]) {
    return false;
  }

  migPlan.spec.persistentVolumes = migPlan.spec.persistentVolumes.map(v => {
    const userPv = planValues.persistentVolumes.find(upv => upv.name === v.name);
    if (userPv) {
      v.selection.action = userPv.type;
      const selectedStorageClassObj = planValues[pvStorageClassAssignmentKey][v.name];
      if (selectedStorageClassObj) {
        v.selection.storageClass = selectedStorageClassObj.name;
      } else {
        v.selection.storageClass = '';
      }
    }
    return v;
  });

  return true;
}

export function updatePlanClosure(migPlan: ReturnType<typeof createMigPlan>, planValues: any): boolean {
  if (!planValues.planClosed || migPlan.spec.closed) {
    return false;
  }

  migPlan.spec.closed = true;

  return true;
}

export function updateMigPlanFromValues(migPlan: ReturnType<typeof createMigPlan>, planValues: any) {

  const updated = [
    updatePlanNamespaces(migPlan, planValues),
    updatePlanSourceCluster(migPlan, planValues),
    updatePlanDestinationCluster(migPlan, planValues),
    updatePlanStorage(migPlan, planValues),
    updatePlanPersistentVolumes(migPlan, planValues),
    updatePlanClosure(migPlan, planValues),
  ];

  if (updated.some((update) => update)) {
    return {
      apiVersion: migPlan.apiVersion,
      kind: migPlan.kind,
      metadata: migPlan.metadata,
      spec: migPlan.spec,
    };
  }
}

export function createMigPlan(
  name: string,
  namespace: string,
  sourceClusterObj: any,
  destinationClusterObj: any,
  storageObj: any,
  namespaces: string[]
) {
  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigPlan',
    metadata: {
      name,
      namespace,
      resourceVersion: '',
    },
    spec: {
      srcMigClusterRef: {
        name: sourceClusterObj,
        namespace,
      },
      destMigClusterRef: {
        name: destinationClusterObj,
        namespace,
      },
      migStorageRef: {
        name: storageObj,
        namespace,
      },
      namespaces,
      persistentVolumes: [],
      closed: false,
    },
  };
}

export function createMigMigration(
  migID: string,
  planName: string,
  namespace: string,
  isStage: boolean,
  disableQuiesce: boolean
) {
  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigMigration',
    metadata: {
      name: migID,
      namespace,
    },
    spec: {
      migPlanRef: {
        name: planName,
        namespace,
      },
      quiescePods: !isStage && !disableQuiesce,
      stage: isStage,
    },
  };
}

export type IMigPlan = ReturnType<typeof createMigPlan>;
export type IMigCluster = ReturnType<typeof createMigCluster>;
export type IMigMigration = ReturnType<typeof createMigMigration>;
export type IMigStorage = ReturnType<typeof createMigStorage>;
export type IStorageSecret = ReturnType<typeof createStorageSecret>;
