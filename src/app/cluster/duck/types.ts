export interface IMigClusterStorageClass {
  name: string;
  provisioner: string;
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
  spec: {
    clusterAuthSecretRef: {
      name: string;
      namespace: string;
    };
    clusterUrl: string;
    storageClasses: IMigClusterStorageClass[];
  };
  id: string;
}
