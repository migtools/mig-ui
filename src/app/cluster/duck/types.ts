import { IStatusCondition } from '../../common/duck/types';
export interface IClusterSpec {
  url: string;
  serviceAccountSecretRef: {
    name: string;
    namespace: string;
  };
  isHostCluster: boolean;
  insecure: boolean;
  exposedRegistryPath?: string;
  clusterUrl?: string;
  azureResourceGroup?: string;
  caBundle?: string;
  isAzure?: boolean;
}
export interface IMigCluster {
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
    namespaces: any[]; // TODO
    resourceVersion: string;
    selfLink: string;
    uid: string;
  };
  spec: IClusterSpec;
  status: {
    conditions: IStatusCondition[];
    observedDigest: string;
    registryPath?: string;
    operatorVersion?: string;
  };
  id: string;
}

export interface ICluster {
  MigCluster: IMigCluster;
  ClusterStatus?: {
    hasReadyCondition?: boolean;
    hasCriticalCondition?: boolean;
    hasWarnCondition?: boolean;
    errorMessage?: string;
    conditionType?: string;
  };
  Secret?: {
    data: {
      saToken: string;
    };
  };
}
