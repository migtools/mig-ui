import { IStatusCondition } from '../../common/duck/types';

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
  spec: {
    url: string;
    clusterAuthSecretRef: {
      name: string;
      namespace: string;
    };
    clusterUrl: string;
    isHostCluster: boolean;
    azureResourceGroup: string;
    insecure: boolean;
    caBundle: string;
    exposedRegistryPath?: string;
  };
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
    errorMessage?: string;
  };
  Secret?: {
    data: {
      saToken: string;
    };
  };
}
