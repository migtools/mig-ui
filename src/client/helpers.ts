import { NamespacedResource, IGroupVersionKindPlural } from '@migtools/lib-ui';

export class MigResource extends NamespacedResource {
  private _gvk: IGroupVersionKindPlural;
  constructor(kind: MigResourceKind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: 'migration.openshift.io',
      version: 'v1alpha1',
      kindPlural: kind,
    };
  }
  gvk(): IGroupVersionKindPlural {
    return this._gvk;
  }
}

export enum MigResourceKind {
  MigPlan = 'migplans',
  MigStorage = 'migstorages',
  MigAssetCollection = 'migassetcollections',
  MigStage = 'migstages',
  MigMigration = 'migmigrations',
  MigCluster = 'migclusters',
  MigHook = 'mighooks',
  MigToken = 'migtokens',
  MigAnalytic = 'miganalytics',
}
export class CommonResource extends NamespacedResource {
  private _gvk: IGroupVersionKindPlural;
  constructor(kind: CommonResourceKind, namespace: string, group: string, version: string) {
    super(namespace);

    this._gvk = {
      group: group,
      version: version,
      kindPlural: kind,
    };
  }
  gvk(): IGroupVersionKindPlural {
    return this._gvk;
  }
}

export enum CommonResourceKind {
  ClusterServiceVersion = 'clusterserviceversions',
  PackageManifest = 'packagemanifests',
  Route = 'routes',
}
