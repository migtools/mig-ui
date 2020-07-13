import { IFormValues } from '../../app/home/pages/PlansPage/components/Wizard/WizardContainer';
import {
  HooksClusterType,
  HooksImageType,
} from '../../app/home/pages/PlansPage/components/Wizard/HooksFormComponent';
import { IMigPlan } from '../../app/plan/duck/types';
import { INameNamespaceRef } from '../../app/common/duck/types';
import { NON_ADMIN_ENABLED } from '../../TEMPORARY_GLOBAL_FLAGS';

export function createMigClusterSecret(
  name: string,
  namespace: string,
  rawToken: string,
  createdForResourceType: string,
  createdForResource: string
) {
  // btoa => to base64, atob => from base64
  const encodedToken = btoa(rawToken);
  return {
    apiVersion: 'v1',
    data: {
      saToken: encodedToken,
    },
    kind: 'Secret',
    metadata: {
      generateName: `${name}-`,
      namespace,
      labels: {
        createdForResourceType,
        createdForResource,
      },
    },
    type: 'Opaque',
  };
}

export function getTokenSecretLabelSelector(
  createdForResourceType: string,
  createdForResource: string
) {
  return {
    labelSelector: `createdForResourceType=${createdForResourceType},createdForResource=${createdForResource}`,
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
  tokenSecret: any,
  isAzure: boolean,
  azureResourceGroup: string,
  requireSSL: boolean,
  caBundle: string
) {
  clusterUrl = clusterUrl.trim();

  let specObject;
  if (isAzure) {
    specObject = {
      azureResourceGroup,
      isHostCluster: false,
      url: clusterUrl,
      serviceAccountSecretRef: {
        name: tokenSecret.metadata.name,
        namespace: tokenSecret.metadata.namespace,
      },
      insecure: !requireSSL,
    };
  } else {
    specObject = {
      isHostCluster: false,
      url: clusterUrl,
      serviceAccountSecretRef: {
        name: tokenSecret.metadata.name,
        namespace: tokenSecret.metadata.namespace,
      },
      insecure: !requireSSL,
    };
  }
  if (caBundle) {
    specObject['caBundle'] = caBundle;
  }

  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigCluster',
    metadata: {
      name,
      namespace,
    },
    spec: specObject,
  };
}

export function createMigStorage(
  name: string,
  bslProvider: string,
  namespace: string,
  tokenSecret: any,
  requireSSL: boolean,
  caBundle: string,
  awsBucketName?: string,
  awsBucketRegion?: string,
  s3Url?: string,
  gcpBucket?: string,
  azureResourceGroup?: string,
  azureStorageAccount?: string
) {
  switch (bslProvider) {
    case 'aws-s3':
    case 'generic-s3':
      return {
        apiVersion: 'migration.openshift.io/v1alpha1',
        kind: 'MigStorage',
        metadata: {
          name,
          namespace,
          annotations: {
            'migration.openshift.io/mig-ui.aws-s3': bslProvider === 'aws-s3' ? 'true' : 'false',
          },
        },
        spec: {
          backupStorageProvider: 'aws',
          volumeSnapshotProvider: 'aws',
          backupStorageConfig: {
            awsBucketName,
            awsRegion: awsBucketRegion,
            awsS3Url: s3Url.trim(),
            credsSecretRef: {
              name: tokenSecret.metadata.name,
              namespace: tokenSecret.metadata.namespace,
            },
            insecure: !requireSSL,
            s3CustomCABundle: caBundle || undefined,
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
            gcpBucket,
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

    case 'azure':
      return {
        apiVersion: 'migration.openshift.io/v1alpha1',
        kind: 'MigStorage',
        metadata: {
          name,
          namespace,
        },
        spec: {
          backupStorageProvider: 'azure',
          volumeSnapshotProvider: 'azure',
          backupStorageConfig: {
            azureResourceGroup,
            azureStorageAccount,
            azureStorageContainer: 'velero',
            credsSecretRef: {
              name: tokenSecret.metadata.name,
              namespace: tokenSecret.metadata.namespace,
            },
          },
          volumeSnapshotConfig: {
            //azure specific config
            azureApiTimeout: '30s',
            azureResourceGroup,
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
  bslProvider: string,
  bucketName: string,
  bucketRegion: string,
  s3Url: string,
  gcpBucket: string,
  azureResourceGroup: string,
  azureStorageAccount: string,
  requireSSL: boolean,
  caBundle: string
) {
  switch (bslProvider) {
    case 'aws-s3':
    case 'generic-s3':
      return {
        spec: {
          backupStorageConfig: {
            awsBucketName: bucketName,
            awsRegion: bucketRegion,
            awsS3Url: s3Url.trim(),
            insecure: !requireSSL,
            s3CustomCABundle: caBundle || undefined,
          },
          volumeSnapshotConfig: {
            awsRegion: bucketRegion,
          },
        },
      };
    case 'gcp':
      return {
        spec: {
          backupStorageConfig: {
            gcpBucket,
          },
        },
      };
    case 'azure':
      return {
        spec: {
          backupStorageConfig: {
            azureResourceGroup,
            azureStorageAccount,
          },
          volumeSnapshotConfig: {
            azureResourceGroup,
          },
        },
      };
  }
}

export function createStorageSecret(
  name: string,
  namespace: string,
  bslProvider: string,
  secretKey?: any,
  accessKey?: string,
  gcpBlob?: any,
  azureBlob?: any
) {
  switch (bslProvider) {
    case 'aws-s3':
    case 'generic-s3':
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
          generateName: `${name}-`,
          namespace,
        },
        type: 'Opaque',
      };

    case 'gcp':
      const gcpCred = btoa(gcpBlob);
      return {
        apiVersion: 'v1',
        data: {
          'gcp-credentials': gcpCred,
        },
        kind: 'Secret',
        metadata: {
          generateName: `${name}-`,
          namespace,
        },
        type: 'Opaque',
      };

    case 'azure':
      const azureCred = btoa(azureBlob);
      return {
        apiVersion: 'v1',
        data: {
          'azure-credentials': azureCred,
        },
        kind: 'Secret',
        metadata: {
          generateName: `${name}-`,
          namespace,
        },
        type: 'Opaque',
      };
  }
  // btoa => to base64, atob => from base64
}

export function updateStorageSecret(
  bslProvider: string,
  secretKey: any,
  accessKey: string,
  gcpBlob: any,
  azureBlob: any
) {
  switch (bslProvider) {
    case 'aws-s3':
    case 'generic-s3':
      // btoa => to base64, atob => from base64
      const encodedAccessKey = btoa(accessKey);
      const encodedSecretKey = btoa(secretKey);
      return {
        data: {
          'aws-access-key-id': encodedAccessKey,
          'aws-secret-access-key': encodedSecretKey,
        },
      };
    case 'gcp':
      const gcpCred = btoa(gcpBlob);
      return {
        data: {
          'gcp-credentials': gcpCred,
        },
      };
    case 'azure':
      const azureCred = btoa(azureBlob);
      return {
        data: {
          'azure-credentials': azureCred,
        },
      };
  }
}

interface IPlanValues extends IFormValues {
  planClosed?: boolean;
}

export function updateMigPlanFromValues(
  migPlan: IMigPlan,
  planValues: IPlanValues,
  currentPlan: IMigPlan
) {
  const updatedSpec: IMigPlan['spec'] = Object.assign({}, migPlan.spec);
  if (planValues.selectedStorage) {
    updatedSpec.migStorageRef = {
      name: planValues.selectedStorage,
      namespace: migPlan.metadata.namespace,
    };
  }
  if (planValues.sourceCluster) {
    updatedSpec.srcMigClusterRef = {
      name: planValues.sourceCluster,
      namespace: migPlan.metadata.namespace,
    };
  }
  if (planValues.targetCluster) {
    updatedSpec.destMigClusterRef = {
      name: planValues.targetCluster,
      namespace: migPlan.metadata.namespace,
    };
  }
  if (NON_ADMIN_ENABLED) {
    if (planValues.sourceTokenRef) {
      updatedSpec.srcMigTokenRef = { ...planValues.sourceTokenRef };
    }
    if (planValues.targetTokenRef) {
      updatedSpec.destMigTokenRef = { ...planValues.targetTokenRef };
    }
  }
  if (updatedSpec.namespaces) {
    updatedSpec.namespaces = planValues.selectedNamespaces;
  }
  if (updatedSpec.persistentVolumes) {
    updatedSpec.persistentVolumes = updatedSpec.persistentVolumes.map((v) => {
      const userPv = planValues.persistentVolumes.find((upv) => upv.name === v.name);
      if (userPv) {
        v.selection.action = userPv.type;
        const selectedCopyMethod = planValues.pvCopyMethodAssignment[v.name];
        if (selectedCopyMethod) {
          v.selection.copyMethod = selectedCopyMethod;
        }

        v.selection.verify =
          selectedCopyMethod === 'filesystem' && planValues.pvVerifyFlagAssignment[v.name];

        const selectedStorageClassObj = planValues.pvStorageClassAssignment[v.name];
        if (selectedStorageClassObj) {
          v.selection.storageClass = selectedStorageClassObj.name;
        } else {
          v.selection.storageClass = '';
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
  sourceTokenRef: INameNamespaceRef,
  destinationClusterObj: any,
  destinationTokenRef: INameNamespaceRef,
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
      ...(NON_ADMIN_ENABLED
        ? {
            srcMigTokenRef: { ...sourceTokenRef },
            destMigTokenRef: { ...destinationTokenRef },
          }
        : {}),
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

export function updateMigHook(
  currentHook: any,
  migHook: any,
  currentPlanHookRef: any,
  namespace: string,
  currentPlan: IMigPlan
) {
  const getImage = (imageType) => {
    if (imageType === HooksImageType.Ansible) {
      return migHook.ansibleRuntimeImage;
    }
    if (imageType === HooksImageType.Custom) {
      return migHook.customContainerImage;
    }
  };

  const getPlaybook = (imageType) => {
    if (imageType === HooksImageType.Ansible) {
      const encodedPlaybook = btoa(migHook.ansibleFile);

      return encodedPlaybook;
    }
    if (imageType === HooksImageType.Custom) {
      return '';
    }
  };

  const currentImage = currentHook.image;
  const image = getImage(migHook.hookImageType);
  const imageUpdated = image !== currentImage;
  const imageValue = imageUpdated ? image : currentImage;

  const currentPlaybook = currentHook.ansibleFile;
  const playbook = getPlaybook(migHook.hookImageType);
  const playbookUpdated = playbook !== currentPlaybook;
  const playbookValue = playbookUpdated ? playbook : currentPlaybook;

  const currentTargetCluster = currentHook.clusterType;
  const targetClusterUpdated = migHook.clusterType !== currentTargetCluster;
  const targetClusterValue = targetClusterUpdated ? migHook.clusterType : currentTargetCluster;

  const isCustom = migHook.hookImageType === HooksImageType.Custom ? true : false;

  const migHookSpec = {
    image: imageValue,
    playbook: playbookValue,
    targetCluster: targetClusterValue,
    custom: isCustom,
  };

  const currentExecutionNamespace = currentPlanHookRef.executionNamespace;
  const currentServiceAccount = currentPlanHookRef.serviceAccount;
  let executionNamespaceUpdated;
  let executionNamespaceValue;
  let serviceAccountUpdated;
  let serviceAccountValue;
  if (migHook.clusterType === HooksClusterType.Source) {
    executionNamespaceUpdated = migHook.srcServiceAccountNamespace !== currentExecutionNamespace;
    executionNamespaceValue = executionNamespaceUpdated
      ? migHook.srcServiceAccountNamespace
      : currentExecutionNamespace;
    serviceAccountUpdated = migHook.srcServiceAccountName !== currentServiceAccount;
    serviceAccountValue = serviceAccountUpdated
      ? migHook.srcServiceAccountName
      : currentServiceAccount;
  }
  if (migHook.clusterType === HooksClusterType.Destination) {
    executionNamespaceUpdated = migHook.destServiceAccountNamespace !== currentExecutionNamespace;
    executionNamespaceValue = executionNamespaceUpdated
      ? migHook.destServiceAccountNamespace
      : currentExecutionNamespace;
    serviceAccountUpdated = migHook.destServiceAccountName !== currentServiceAccount;
    serviceAccountValue = serviceAccountUpdated
      ? migHook.destServiceAccountName
      : currentServiceAccount;
  }

  const currentPhase = currentPlanHookRef.phase;
  const phaseUpdated = migHook.migrationStep !== currentPhase;
  const phaseValue = phaseUpdated ? migHook.migrationStep : currentPhase;

  const updatedHooksSpec = currentPlan.spec.hooks;
  const currentPlanHookRefSpec = {
    executionNamespace: executionNamespaceValue,
    phase: phaseValue,
    reference: {
      name: migHook.hookName,
      namespace: namespace,
    },
    serviceAccount: serviceAccountValue,
  };

  const foundIndex = updatedHooksSpec.findIndex((hook) => hook.reference.name == migHook.hookName);
  updatedHooksSpec[foundIndex] = currentPlanHookRefSpec;

  if (
    !imageUpdated &&
    !playbookUpdated &&
    !targetClusterUpdated &&
    !executionNamespaceUpdated &&
    !phaseUpdated &&
    !serviceAccountUpdated
  ) {
    console.warn('A hook update was requested, but nothing was changed');
    return;
  }

  return {
    migHookPatch: {
      spec: migHookSpec,
    },
    currentPlanHookRefPatch: {
      spec: {
        hooks: updatedHooksSpec,
      },
    },
  };
}

export function createMigHook(migHook: any, namespace: string) {
  const getImage = (imageType) => {
    if (imageType === HooksImageType.Ansible) {
      return migHook.ansibleRuntimeImage;
    }
    if (imageType === HooksImageType.Custom) {
      return migHook.customContainerImage;
    }
  };

  const getPlaybook = (imageType) => {
    if (imageType === HooksImageType.Ansible) {
      const encodedPlaybook = btoa(migHook.ansibleFile);

      return encodedPlaybook;
    }
    if (imageType === HooksImageType.Custom) {
      return '';
    }
  };

  const image = getImage(migHook.hookImageType);
  const playbook = getPlaybook(migHook.hookImageType);
  const isCustom = migHook.hookImageType === HooksImageType.Custom ? true : false;

  const migHookSpec = {
    image,
    playbook,
    targetCluster: migHook.clusterType,
    custom: isCustom,
  };

  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigHook',
    metadata: {
      generateName: `${migHook.hookName}-`,
      namespace,
    },
    spec: migHookSpec,
  };
}

export function createMigTokenSecret(name: string, namespace: string, rawToken: string) {
  // btoa => to base64, atob => from base64
  const encodedToken = btoa(rawToken);
  return {
    apiVersion: 'v1',
    data: {
      token: encodedToken,
    },
    kind: 'Secret',
    metadata: {
      generateName: `${name}-`,
      namespace,
    },
    type: 'Opaque',
  };
}

export function createMigToken(
  name: string,
  namespace: string,
  migTokenSecretName: string,
  migTokenSecretNamespace: string,
  migClusterName: string
) {
  return {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigToken',
    metadata: {
      name,
      namespace,
    },
    spec: {
      migClusterRef: {
        name: migClusterName,
        namespace,
      },
      secretRef: {
        name: migTokenSecretName,
        namespace: migTokenSecretNamespace,
      },
    },
  };
}

export type IMigHook = ReturnType<typeof createMigHook>;
export type IMigCluster = ReturnType<typeof createMigCluster>;
export type IMigMigration = ReturnType<typeof createMigMigration>;
export type IMigStorage = ReturnType<typeof createMigStorage>;
export type IStorageSecret = ReturnType<typeof createStorageSecret>;
