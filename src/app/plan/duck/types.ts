export type PvCopyMethod = 'filesystem' | 'snapshot';

export interface IPlanPersistentVolume {
  name: string;
  pvc: {
    namespace: string;
    name: string;
  };
  storageClass?: string;
  capacity: string;
  supported: {
    actions: string[];
    copyMethods: PvCopyMethod[];
  };
  selection?: {
    action: string;
    storageClass: string;
    copyMethod: PvCopyMethod;
    verify: boolean;
  };
}

export interface INameNamespaceRef {
  name: string;
  namespace: string;
}

export interface IPlanSpecHook {
  reference: {
    name: string;
  };
}

export interface IPlan {
  apiVersion: string;
  kind: string;
  metadata: INameNamespaceRef;
  spec: {
    persistentVolumes?: IPlanPersistentVolume[];
    migStorageRef?: INameNamespaceRef;
    srcMigClusterRef?: INameNamespaceRef;
    destMigClusterRef?: INameNamespaceRef;
    namespaces?: string[];
    closed?: boolean;
    hooks?: IPlanSpecHook[];
  };
}

export interface IPersistentVolumeResource {
  name: string;
}

export interface ISourceClusterNamespace {
  name: string;
  podCount: number;
  pvcCount: number;
  serviceCount: number;
}
