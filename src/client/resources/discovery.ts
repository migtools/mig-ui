import { DiscoveryResource, IDiscoveryPath } from './common';

export class NamespaceDiscovery extends DiscoveryResource {
  private _discoveryPath: IDiscoveryPath;
  private _cluster: string;

  constructor(namespace: string, cluster: string, { wait = 5, offset = -1, limit = -1 } = {}) {
    super('namespaces');

    this._cluster = [namespace, cluster].join('/');
    this._discoveryPath = {
      'wait': wait,
      'offset': offset,
      'limit': limit,
    };
  }

  public discoveryPath(): IDiscoveryPath {
    return this._discoveryPath;
  }

  public for() {
    return { 'cluster': this._cluster };
  }
}
