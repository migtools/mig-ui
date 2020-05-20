// TODO: Add other properties used by components in this wizard, possibly move this somewhere more common
//       If we remove the `[key: string]: any;` lines, missing property types will surface elsewhere as errors

export type PvCopyMethod = 'filesystem' | 'snapshot';

export interface IPlanPersistentVolume {
  name: string;
  pvc: {
    namespace: string;
    name: string;
    [key: string]: any; // Allow additional unknown properties on each of these for now
  };
  storageClass?: string;
  capacity: string;
  supported: {
    actions: string[];
    copyMethods: PvCopyMethod[];
    [key: string]: any;
  };
  selection?: {
    action: string;
    storageClass: string;
    copyMethod: PvCopyMethod;
    verify: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface INameNamespaceRef {
  name: string;
  namespace: string;
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
    [key: string]: any;
  };
  [key: string]: any;
}

export interface IPersistentVolumeResource {
  name: string;
  [key: string]: any;
}

export interface ISourceClusterNamespace {
  name: string;
  podCount: number;
  pvcCount: number;
  serviceCount: number;
}

export interface IClusterStorageClass {
  name: string;
  provisioner: string;
}

export interface ICluster {
  metadata: {
    name: string;
    [key: string]: any;
  };
  spec: {
    storageClasses: IClusterStorageClass[];
    [key: string]: any;
  };
  [key: string]: any;
}
