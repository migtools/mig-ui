export type KubeResource = NamespacedResource | ClusterResource;

export interface IKubeResource {
  listPath(): string;
  namedPath(name: string): string;
}

export interface IDiscoveryResource {
  discoveryAggregator(): string;
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
  offset?: number;
  limit?: number;
  [param: string]: string | number;
}

export type TokenExpiryHandler = (oldToken: object) => void;

function namedPath(listPath, name) {
  return [listPath, name].join('/');
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


export abstract class DiscoveryResource implements IDiscoveryResource {

  private readonly _type: string;
  private readonly _aggregatorType: string;
  private readonly _aggregatorName: string;
  private _discoveryParameters: IDiscoveryParameters;

  constructor(
    aggregatorName: string,
    type: string,
    discoveryParameters: IDiscoveryParameters,
    customAggregatorType = 'clusters'
  ) {
    this._aggregatorType = customAggregatorType;
    this._aggregatorName = aggregatorName;
    this._type = type;
    this._discoveryParameters = discoveryParameters;
  }

  public discoveryType() { return this._type; }

  public discoveryAggregator() {
    return [this._aggregatorType, this._aggregatorName].join('/');
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
      this.discoveryAggregator(),
      this.discoveryType(),
    ].join('/');
  }

}

export abstract class NamedDiscoveryResource
  extends DiscoveryResource
  implements INamedDiscoveryResource {

  private readonly _name: string;

  constructor(
    name: string,
    aggregator: string,
    type: string,
    discoveryParameters: IDiscoveryParameters,
    customAggregatorType = 'clusters'
  ) {
    super(aggregator, type, discoveryParameters, customAggregatorType);

    this._name = name;
  }

  public discoveryName() { return this._name; }

  public path(): string {
    return [
      super.path(),
      this.discoveryName()
    ].join('/');
  }
}


export abstract class OAuthClient {
  private _token: string;
  private _tokenExpiryTime: number;
  private _tokenExpiryHandler: TokenExpiryHandler;

  constructor(token: string) {
    this._token = token;
  }

  public getOAuthHeader() {
    return {
      Authorization: `Bearer ${this._token}`,
    };
  }

  public setTokenExpiryHandler(handler: TokenExpiryHandler, tokenExpiryTime: number) {
    this._tokenExpiryHandler = handler;
    this._tokenExpiryTime = tokenExpiryTime;
  }

  public checkExpiry(err) {
    if (err.response && err.response.status === 401) {
      this._tokenExpiryHandler(this._oldToken());
    }
  }

  private _oldToken() {
    return {
      token: this._token,
      tokenExpiryTime: this._tokenExpiryTime,
    };
  }
}
