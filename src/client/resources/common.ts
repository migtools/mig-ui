export type KubeResource = NamespacedResource | ClusterResource;

export interface IResource {
  listPath(): string;
  namedPath(name: string): string;
}

export interface IGroupVersionKindPlural {
  group: string;
  version: string;
  kindPlural: string;
}

export interface IDiscoveryParametrs {
  wait: number;
  offset?: number;
  limit?: number;
}

export abstract class NamespacedResource {
  public abstract gvk(): IGroupVersionKindPlural;
  public namespace: string;
  constructor(namespace: string) {
    if (!namespace) {
      throw new Error('NamespacedResource must be passed a namespace, it was undefined');
    }
    this.namespace = namespace;
  }

  public listPath(): string {
    return [
      '/apis',
      this.gvk().group,
      this.gvk().version,
      'namespaces',
      this.namespace,
      this.gvk().kindPlural,
    ].join('/');
  }

  public namedPath(name): string {
    return namedPath(this.listPath(), name);
  }
}

export abstract class ClusterResource {
  public abstract gvk(): IGroupVersionKindPlural;
  public listPath(): string {
    return ['/apis', this.gvk().group, this.gvk().version, this.gvk().kindPlural].join('/');
  }
  public namedPath(name): string {
    return namedPath(this.listPath(), name);
  }
}

function namedPath(listPath, name) {
  return [listPath, name].join('/');
}

export abstract class DiscoveryResource {

  private _type: string;
  private _namespace: string;
  public abstract discoveryParameters(): IDiscoveryParametrs;
  public abstract for(): string;

  constructor(namespace: string, type: string) {
    if (!type) {
      throw new Error('DiscoveryResource must have a type, it was undefined');
    }
    if (!namespace) {
      throw new Error('DiscoveryResource must have a namespace, it was undefined');
    }
    this._type = type;
    this._namespace = namespace;
  }

  public discoveryNamespace() {
    return ['namespaces', this._namespace].join('/');
  }

  public discoveryType() { return this._type + '/'; }

  public parametrizedPath(params = {}) {
    if (this.discoveryParameters().wait !== -1) {
      params['wait'] = this.discoveryParameters().wait.toString();
    }
    if (this.discoveryParameters().offset !== -1) {
      params['offset'] = this.discoveryParameters().offset.toString();
    }
    if (this.discoveryParameters().limit !== -1) {
      params['limit'] = this.discoveryParameters().limit.toString();
    }

    return params;
  }

}

export abstract class ClusterDiscoveryResource extends DiscoveryResource {
  private _cluster: string;

  constructor(namespace: string, cluster: string, type: string) {
    if (!cluster) {
      throw new Error('ClusterDiscoveryResource must have a cluster, it was undefined');
    }
    super(namespace, type);
    this._cluster = cluster;
  }

  public discoveryCluster() {
    return ['clusters', this._cluster].join('/');
  }
}
