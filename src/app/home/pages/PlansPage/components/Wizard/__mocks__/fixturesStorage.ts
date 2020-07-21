import { IStorage } from '../../../../../../storage/duck/types';

export const storageExample1: IStorage = {
  MigStorage: {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigStorage',
    metadata: {
      creationTimestamp: '2020-06-24T07:39:14Z',
      generation: 2,
      labels: {
        'controller-ToolsIcon.k8s.io': 1,
        'migrations.openshift.io/migration-group': '',
      },
      name: 'minio',
      namespace: 'openshift-migration',
      resourceVersion: '6151659',
      selfLink: '',
      uid: '886a5f3e-511d-4703-8460-fc4410e1fa1b',
      annotations: {
        'migration.openshift.io/mig-ui.aws-s3': 'false',
      },
    },
    spec: {
      bucketUrl: '',
      backupStorageConfig: {
        awsBucketName: 'bucket-name',
        awsRegion: 'eu-central-1',
        awsS3Url: 'http://minio-gpte-minio.apps.cluster.example.com',
        gcpBucket: 'string',
        azureResourceGroup: 'string',
        azureStorageAccount: 'string',
        insecure: true,
        s3CustomCABundle: 'string',
      },
      backupStorageProvider: 'aws',
      backupStorageLocationRef: { name: '' },
      migrationStorageSecretRef: {
        name: '',
        namespace: '',
      },
    },
    id: '',
    status: {
      conditions: [
        {
          category: 'Required',
          lastTransitionTime: '2020-06-24T07:39:14Z',
          message: 'The storage is ready.',
          status: '',
          type: '',
        },
      ],
    },
  },
  Secret: {
    data: {
      'aws-access-key-id': 'bWluaW8=',
      'aws-secret-access-key': 'bWluaW8xMjM=',
      'gcp-credentials': '',
      'azure-credentials': '',
    },
  },
  StorageStatus: {
    hasReadyCondition: true,
  },
};
