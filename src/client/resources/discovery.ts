import { NamedDiscoveryResource, DiscoveryResource, IDiscoveryParameters } from './common';

export class NamespaceDiscovery extends DiscoveryResource {
  constructor(cluster: string, params: IDiscoveryParameters = {}) {
    super(cluster, 'namespaces', params);
  }
}
export class PersistentVolumesDiscovery extends DiscoveryResource {
  constructor(cluster: string, params: IDiscoveryParameters = {}) {
    super(cluster, 'persistentvolumes', params);
  }
}

export class PersistentVolumeDiscovery extends NamedDiscoveryResource {
  constructor(name: string, cluster: string, params: IDiscoveryParameters = {}) {
    super(name, cluster, 'persistentvolumes', params);
  }
}

