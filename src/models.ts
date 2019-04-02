interface IMigClusterMetadata {
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
interface IMigClusterSpec {
  clusterAuthSecretRef: {
    name: string;
    namespace: string;
  };
  clusterUrl: string;
}
export interface IMigCluster {
  apiVersion: string;
  kind: string;
  metadata: IMigClusterMetadata;
  spec: IMigClusterSpec;
  id: string;
}
export interface IClusterFormObject {
  url: string;
  token: string;
}

interface IMigStorageMetadata {
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
interface IMigStorageSpec {
  backupStorageLocationRef: {
    name: string;
  };
  migrationStorageSecretRef: {
    name: string;
    namespace: string;
  };
}
export interface IMigStorage {
  apiVersion: string;
  kind: string;
  metadata: IMigStorageMetadata;
  spec: IMigStorageSpec;
  id: string;
}
export interface IStorageFormObject {
  url: string;
  token: string;
}
