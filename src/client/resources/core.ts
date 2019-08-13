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
  public namedPath(name): string {
    console.log('name 46', name)
    return namedPath(this.listPath(), name);
  }
}
function namedPath(listPath, name) {
  console.log('name 52', name)
  return [listPath, name].join('/');
}




export enum CoreNamespacedResourceKind {
  Pod = 'pods',
  Secret = 'secrets',
}

export enum CoreClusterResourceKind {
  Namespace = 'namespaces',
  PV = 'persistentvolumes'
}
