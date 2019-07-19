import { NamespacedResource, IGroupVersionKindPlural } from './common';

export class StorageClassesResource extends NamespacedResource {
  private _gvk: IGroupVersionKindPlural;
  constructor(kind: StorageClassesResourceKind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: 'storage.k8s.io',
      version: 'v1',
      kindPlural: kind,
    };
  }
  gvk(): IGroupVersionKindPlural {
    return this._gvk;
  }
}

export enum StorageClassesResourceKind {
  StorageClass = 'storageclasses',
}
