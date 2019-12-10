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

export interface IDiscoveryPath {
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

  public type: string;
  public abstract discoveryPath(): IDiscoveryPath;
  public abstract for(): object;

  constructor(type: string) {
    if (!type) {
      throw new Error('DiscoveryResource must have a type, it was undefined');
    }
    this.type = type + '/';
  }

  public parametrizedPath(params = {}) {
    if (this.discoveryPath().wait !== -1) {
      params['wait'] = this.discoveryPath().wait.toString();
    }
    if (this.discoveryPath().offset !== -1) {
      params['offset'] = this.discoveryPath().offset.toString();
    }
    if (this.discoveryPath().limit !== -1) {
      params['limit'] = this.discoveryPath().limit.toString();
    }

    return params;
  }

}
