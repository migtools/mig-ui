import { NamespacedResource, ClusterResource, IGroupVersionKindPlural } from './common';

export class CoreNamespacedResource extends NamespacedResource {
  private _gvk: IGroupVersionKindPlural;
  constructor(kind: CoreNamespacedResourceKind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: '',
      version: 'v1',
      kindPlural: kind,
    };
  }
  gvk(): IGroupVersionKindPlural {
    return this._gvk;
  }

  public listPath(): string {
    // The core resources live at a unique api path for legacy reasons, and do
    // not have an API group
    return ['/api', this.gvk().version, 'namespaces', this.namespace, this.gvk().kindPlural].join(
      '/'
    );
  }
}

export class ExtendedCoreNamespacedResource extends CoreNamespacedResource {
  private _operation: ExtendedCoreNamespacedResourceKind;
  constructor(kind: CoreNamespacedResourceKind, namespace: string, operation: ExtendedCoreNamespacedResourceKind) {
    super(kind, namespace);

    this._operation = operation;
  }

  public showOperation(): ExtendedCoreNamespacedResourceKind {
    return this._operation;
  }

  public namedPath(name): string {
    return [this.listPath(), name, this._operation].join('/');
  }

}

export class CoreClusterResource extends ClusterResource {
  private _gvk: IGroupVersionKindPlural;
  constructor(kind: CoreClusterResourceKind) {
    super();

    this._gvk = {
      group: '',
      version: 'v1',
      kindPlural: kind,
    };
  }
  gvk(): IGroupVersionKindPlural {
    return this._gvk;
  }

  public listPath(): string {
    // The core resources live at a unique api path for legacy reasons, and do
    // not have an API group
    return ['/api', this.gvk().version, this.gvk().kindPlural].join('/');
  }

}

export enum ExtendedCoreNamespacedResourceKind {
  Log = 'log',
}

export enum CoreNamespacedResourceKind {
  Pod = 'pods',
  Secret = 'secrets',
}

export enum CoreClusterResourceKind {
  Namespace = 'namespaces',
  PV = 'persistentvolumes'
}
