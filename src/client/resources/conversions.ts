import { pvStorageClassAssignmentKey } from '../../app/plan/components/Wizard/StorageClassTable';
import { pvCopyMethodAssignmentKey } from '../../app/plan/components/Wizard/StorageClassTable';

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
  bslProvider: string,
  namespace: string,
  tokenSecret: any,
  awsBucketName?: string,
  awsBucketRegion?: string,
  s3Url?: string,
  gcpBucket?: string
) {
  switch (bslProvider) {
    case 'aws':
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
            awsBucketName: awsBucketName,
            awsRegion: awsBucketRegion,
            awsS3Url: s3Url,
            credsSecretRef: {
              name: tokenSecret.metadata.name,
              namespace: tokenSecret.metadata.namespace,
            },
          },
          volumeSnapshotConfig: {
            awsRegion: awsBucketRegion,
            credsSecretRef: {
              name: tokenSecret.metadata.name,
              namespace: tokenSecret.metadata.namespace,
            },
          },
        },
      };
    case 'gcp':
      return {
        apiVersion: 'migration.openshift.io/v1alpha1',
        kind: 'MigStorage',
        metadata: {
          name,
          namespace,
        },
        spec: {
          backupStorageProvider: 'gcp',
          volumeSnapshotProvider: 'gcp',
          backupStorageConfig: {
            gcpBucket: gcpBucket,
            credsSecretRef: {
              name: tokenSecret.metadata.name,
              namespace: tokenSecret.metadata.namespace,
            },
          },
          volumeSnapshotConfig: {
            //gcp specific config
            credsSecretRef: {
              name: tokenSecret.metadata.name,
              namespace: tokenSecret.metadata.namespace,
            },
          },
        },
      };


  }
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
  bslProvider: string,
  secretKey?: any,
  accessKey?: string,
  gcpBlob?: any,
) {

  switch (bslProvider) {
    case 'aws':
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
    case 'gcp':
      const data = btoa(gcpBlob);
      return {
        apiVersion: 'v1',
        data: {
          'gcp-credentials': data
        },
        kind: 'Secret',
        metadata: {
          name,
          namespace,
        },
        type: 'Opaque',
      };

  }
  // btoa => to base64, atob => from base64
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
        //set action type
        v.selection.action = userPv.type;
        //set storage class
        const selectedStorageClassObj = planValues[pvStorageClassAssignmentKey][v.name];
        if (selectedStorageClassObj) {
          v.selection.storageClass = selectedStorageClassObj.name;
        } else {
          v.selection.storageClass = '';
        }
        //set copy method 
        const selectedCopyMethod = planValues[pvCopyMethodAssignmentKey][v.name];
        if (selectedCopyMethod) {
          v.selection.copyMethod = selectedCopyMethod;
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
