import { NamedClusterDiscoveryResource, ClusterDiscoveryResource, IDiscoveryParameters } from './common';

export class NamespaceDiscovery extends ClusterDiscoveryResource {
  constructor(cluster: string, params: IDiscoveryParameters = {}) {
    super(cluster, 'namespaces', params);
  }
}

export class PersistentVolumeDiscovery extends NamedClusterDiscoveryResource {
  constructor(name: string, cluster: string, params: IDiscoveryParameters = {}) {
    super(name, cluster, 'persistentvolumes', params);
  }
}

export class PersistentVolumesDiscovery extends ClusterDiscoveryResource {
  constructor(cluster: string, params: IDiscoveryParameters = {}) {
    super(cluster, 'persistentvolumes', params);
  }
}
