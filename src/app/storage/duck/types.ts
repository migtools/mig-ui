import { IStatusCondition } from '../../common/duck/types';

export interface IMigStorage {
  apiVersion: string;
  kind: string;
  metadata: {
    creationTimestamp: any;
    generation: number;
    labels: {
      'controller-ToolsIcon.k8s.io': number;
      'migrations.openshift.io/migration-group': string;
    };
    name: string;
    namespace: string;
    resourceVersion: string;
    selfLink: string;
    uid: string;
    annotations: {
      'migration.openshift.io/mig-ui.aws-s3': 'true' | 'false';
    };
  };
  spec: {
    bucketUrl: string;
    backupStorageConfig: {
      awsBucketName: string;
      awsRegion: string;
      awsS3Url: string;
      gcpBucket: string;
      azureResourceGroup: string;
      azureStorageAccount: string;
      insecure: boolean;
      s3CustomCABundle: string;
    };
    backupStorageProvider: string;
    backupStorageLocationRef: {
      name: string;
    };
    migrationStorageSecretRef: {
      name: string;
      namespace: string;
    };
  };
  id: string;
  status: {
    conditions: IStatusCondition[];
  };
}

export interface IStorage {
  MigStorage: IMigStorage;
  Secret: {
    data: {
      'aws-access-key-id': string;
      'aws-secret-access-key': string;
      'gcp-credentials': string;
      'azure-credentials': string;
    };
  };
  StorageStatus?: {
    hasReadyCondition: boolean;
  };
}
