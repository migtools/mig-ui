interface IMigrationClusterMetadata {
  creationTimestamp: any;
  generation: number;
  labels: {
    'controller-ToolsIcon.k8s.io': number;
    'migrations.openshift.io/migration-group': string;
  };
  name: string;
  namespaces: any[];
  resourceVersion: string;
  selfLink: string;
  uid: string;
}
interface IMigrationClusterSpec {
  clusterAuthSecretRef: {
    name: string;
    namespace: string;
  };
  clusterUrl: string;
}
export interface IMigrationCluster {
  apiVersion: string;
  kind: string;
  metadata: IMigrationClusterMetadata;
  spec: IMigrationClusterSpec;
  id: string;
}
export interface IClusterFormObject {
  url: string;
  token: string;
}

interface IMigrationStorageMetadata {
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
}
interface IMigrationStorageSpec {
  backupStorageLocationRef: {
    name: string;
  };
  migrationStorageSecretRef: {
    name: string;
    namespace: string;
  };
}
export interface IMigrationStorage {
  apiVersion: string;
  kind: string;
  metadata: IMigrationStorageMetadata;
  spec: IMigrationStorageSpec;
  id: string;
}
export interface IStorageFormObject {
  url: string;
  token: string;
}
