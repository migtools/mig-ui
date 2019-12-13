export type KubeResource = NamespacedResource | ClusterResource;

export interface IKubeResource {
  listPath(): string;
  namedPath(name: string): string;
}

export interface IDiscoveryResource {
  discoveryCluster(): string;
  discoveryType(): string;
  path(): string;
  parametrized(IDiscoveryParameters?): { [param: string]: string };
}

export interface INamedDiscoveryResource extends IDiscoveryResource {
  discoveryName(): string;
}

export interface IGroupVersionKindPlural {
  group: string;
  version: string;
  kindPlural: string;
}

export interface IDiscoveryParameters {
  wait?: number;
  offset?: number;
  limit?: number;
  [param: string]: string | number;
}

export abstract class NamespacedResource implements IKubeResource {
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

export abstract class ClusterResource implements IKubeResource {
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

export abstract class DiscoveryResource implements IDiscoveryResource {

  private readonly _type: string;
  private readonly _cluster: string;
  private _discoveryParameters: IDiscoveryParameters;

  constructor(cluster: string, type: string, discoveryParameters: IDiscoveryParameters) {
    this._cluster = cluster;
    this._type = type;
    this._discoveryParameters = discoveryParameters;
  }

  public discoveryType() { return this._type; }

  public discoveryCluster() {
    return ['clusters', this._cluster].join('/');
  }

  public parametrized(params: IDiscoveryParameters = {}) {
    const merged = {};
    Object.keys(this._discoveryParameters).map(param =>
      merged[param] = this._discoveryParameters[param].toString());
    Object.keys(params).map(param =>
      merged[param] = this._discoveryParameters[param].toString());
    return merged;
  }

  public path(): string {
    return [
      this.discoveryCluster(),
      this.discoveryType(),
    ].join('/');
  }

}

export abstract class NamedDiscoveryResource
  extends DiscoveryResource
  implements INamedDiscoveryResource {

  private readonly _name: string;

  constructor(name: string, cluster: string, type: string, discoveryParameters: IDiscoveryParameters) {
    super(cluster, type, discoveryParameters);

    this._name = name;
  }

  public discoveryName() { return this._name; }

  public path(): string {
    return [
      this.discoveryCluster(),
      this.discoveryType(),
      this.discoveryName()
    ].join('/');
  }
}
