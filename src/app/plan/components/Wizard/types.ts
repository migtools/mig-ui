// TODO add other properties used by components in this wizard, possibly move this somewhere more common
// Maybe in the future we can somehow generate types like these from the CRDs in mig-controller?

export interface IPlanPersistentVolume {
  name: string;
  pvc: {
    namespace: string;
    name: string;
    [key: string]: any; // Allow additional unknown properties on each of these
  };
  storageClass?: string;
  capacity: string;
  supported: {
    actions: string[];
    [key: string]: any;
  };
  selection?: {
    action: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface IPlan {
  spec: {
    persistentVolumes?: IPlanPersistentVolume[];
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
