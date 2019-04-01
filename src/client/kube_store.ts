import _ from 'lodash';
import {
  NamespacedResource,
  ClusterResource,
  KubeResource,
} from './resources';

export default class KubeStore {
  private static instance: KubeStore;
  public db: any = {
    namespace: {},
    cluster: {},
  };

  public static get Instance() {
    return this.instance || (this.instance = new this());
  }

  public setResource(resource: KubeResource, name: string, newObject: object): object {
    const gvk = `${resource.gvk().group}/${resource.gvk().version}/${resource.gvk().kindPlural}`;
    let toMerge;
    if (resource instanceof NamespacedResource) {
      const namespacedResource = resource as NamespacedResource;
      toMerge = {
        namespace: {
          [namespacedResource.namespace]: {
            [gvk]: {
              [name]: newObject,
            },
          },
        },
      };
    } else {
      toMerge = {
        cluster: {
          [gvk]: {
            [name]: newObject,
          },
        },
      };
    }

    _.merge(this.db, toMerge);
    return newObject;
  }

  public getResource(resource: KubeResource, name: string): object {
    const gvk = `${resource.gvk().group}/${resource.gvk().version}/${resource.gvk().kindPlural}`;
    if (resource instanceof NamespacedResource) {
      const namespacedResource = resource as NamespacedResource;
      return this.db.namespace[namespacedResource.namespace][gvk][name];
    } else {
      return this.db.cluster[gvk][name];
    }
  }

  public listResource(resource: KubeResource): object {
    const gvk = `${resource.gvk().group}/${resource.gvk().version}/${resource.gvk().kindPlural}`;
    let resources;
    if (resource instanceof NamespacedResource) {
      const namespacedResource = resource as NamespacedResource;
      if (!(namespacedResource.namespace in this.db.namespace)) {
        return [];
      }
      if (!(gvk in this.db.namespace[namespacedResource.namespace])) {
        return this.db.namespace[namespacedResource.namespace][gvk];
      }
      resources = this.db.namespace[namespacedResource.namespace][gvk];
    } else {
      resources = this.db.cluster[gvk];
    }
    return Object.keys(resources).map(k => resources[k]);
  }
}
