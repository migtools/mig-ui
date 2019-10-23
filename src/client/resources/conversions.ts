import {
  pvStorageClassAssignmentKey,
  pvCopyMethodAssignmentKey
} from '../../app/plan/components/Wizard/StorageClassTable';

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

export function updateTokenSecret(rawToken: string) {
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

export function updateMigClusterUrl(
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
  bslProvider: string,
  vslProvider: string,
  bslSecret: any,
  vslSecret: any,
  namespace: string,
) {
  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigStorage',
    metadata: {
      name,
      namespace,
    },
    spec: {
      backupStorageProvider: bslProvider,
      volumeSnapshotProvider: vslProvider,
      backupStorageConfig: {
        awsBucketName: bucketName,
        awsRegion: bucketRegion,
        awsS3Url: s3Url,
        // awsS3ForcePathStyle: bool
        // awsPublicUrl: string
        // awsKmsKeyId: string
        // awsSignatureVersion: string
        // gcpBucket: string
        // azureResourceGroup: string
        // azureStorageAccount: string
        credsSecretRef: {
          name: bslSecret.metadata.name,
          namespace: bslSecret.metadata.namespace,
        },
      },
      volumeSnapshotConfig: {
        awsRegion: bucketRegion,
        // azureApiTimeout: metav1.duration,
        // azureResourceGroup string:
        credsSecretRef: {
          name: vslSecret.metadata.name,
          namespace: vslSecret.metadata.namespace,
        },
      },
    },
  };
}

export function updateMigStorage(
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

export function createVSLSecret(
  name: string,
  namespace: string,
  blob: string
) {
  // btoa => to base64, atob => from base64
  const encodedKey = btoa(blob);
  return {
    apiVersion: 'v1',
    data: {
      encodedKey
    },
    kind: 'Secret',
    metadata: {
      name,
      namespace,
    },
    type: 'Opaque',
  };
}

export function updateStorageSecret(secretKey: any, accessKey: string) {
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

export function createMigPlan(
  name: string,
  namespace: string,
  sourceClusterObj: any,
  destinationClusterObj: any,
  storageObj: any
) {
  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigPlan',
    metadata: {
      name,
      namespace,
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
    },
  };
}

export function updateMigPlanFromValues(migPlan: any, planValues: any) {
  const updatedSpec = Object.assign({}, migPlan.spec);
  if (planValues.selectedStorage) {
    updatedSpec.migStorageRef = {
      name: planValues.selectedStorage,
      namespace: migPlan.metadata.namespace,
    };
  }

  if (updatedSpec.persistentVolumes) {
    updatedSpec.persistentVolumes = updatedSpec.persistentVolumes.map(v => {
      const userPv = planValues.persistentVolumes.find(upv => upv.name === v.name);
      if (userPv) {
        v.selection.action = userPv.type;
        const selectedStorageClassObj = planValues[pvStorageClassAssignmentKey][v.name];
        const selectedCopyMethodObj = planValues[pvCopyMethodAssignmentKey][v.name];
        if (selectedStorageClassObj) {
          v.selection.storageClass = selectedStorageClassObj.name;
        } else {
          v.selection.storageClass = '';
        }
        if (selectedCopyMethodObj) {
          v.selection.copyMethod = selectedCopyMethodObj;
        } else {
          v.selection.copyMethod = '';
        }
      }
      return v;
    });
  }
  if (planValues.planClosed) {
    updatedSpec.closed = true;
  }

  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigPlan',
    metadata: migPlan.metadata,
    spec: updatedSpec,
  };
}

export function createInitialMigPlan(
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
