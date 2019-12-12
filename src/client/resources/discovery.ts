import { ClusterDiscoveryResource, IDiscoveryParametrs } from './common';

export class NamespaceDiscovery extends ClusterDiscoveryResource {
  private _discoveryParameters: IDiscoveryParametrs;

  constructor(cluster: string, { wait = -1, offset = -1, limit = -1 } = {}) {
    super(cluster, 'namespaces');

    this._discoveryParameters = {
      'wait': wait,
      'offset': offset,
      'limit': limit,
    };
  }

  public discoveryParameters(): IDiscoveryParametrs {
    return this._discoveryParameters;
  }

  public for() {
    return [
      this.discoveryCluster(),
      this.discoveryType(),
    ].join('/');
  }
}
