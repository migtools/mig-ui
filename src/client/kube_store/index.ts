import _ from 'lodash';
import { NamespacedResource, ClusterResource, KubeResource,
  CoreNamespacedResource, CoreClusterResource, } from '../resources';

import mocked_data from './mocked_data';
import JsonMergePatch from 'json-merge-patch';
const localStorageMockedDataKey = 'CAM_MOCKED_DATA';

export default class KubeStore {
  private static instance: KubeStore;
  private clusterName: string;

  public db: any = {
    namespace: {},
    cluster: {},
  };

  public constructor(clusterName) {
    this.clusterName = clusterName;
    this.ensureDataLoaded();
  }

  private data() {
    // Returns the chunk of data relevant for mocking data from this k8s cluster
    // All subsequent calls will use this data to lookup their responses
    const d = JSON.parse(localStorage.getItem(localStorageMockedDataKey));
    if (! ('clusters' in d)) {
      alert('Unable to find expected mocked data for "clusters"');
      return {};
    }
    if (! (this.clusterName in d['clusters'])) {
      alert('Unable to find expected mocked data for clusterName "' + this.clusterName + '"');
      return {};
    }
    return d['clusters'][this.clusterName];
  }

  private determineKey(resource: KubeResource, name: string): string {
      // Determine the url path as the 'key' for Resource or List of Resources
      // 2 Main Types of Resources
      // - NamespacedResource
      // - ClusterResource
      // Next 2 distinctions,  'Core' or Extension.
      //  Core - are the main types built in k8s
      //  If it's an instance of CoreNamespacedResource or CoreClusterResource
      // Extensions are everything else.

    let key: string = '';

    if (resource instanceof NamespacedResource) {
      const namespacedResource = resource as NamespacedResource;
      if (resource instanceof CoreNamespacedResource) {
        // Core Namespaced
        key = `api/${resource.gvk().version}/namespaces/${namespacedResource.namespace}/${resource.gvk().kindPlural}`;
      } else {
        // Extension Namespaced
        key = `apis/${resource.gvk().group}/${resource.gvk().version}` +
          `/namespaces/${namespacedResource.namespace}/${resource.gvk().kindPlural}`;
      }
    } else {
      if (resource instanceof CoreClusterResource) {
        // Core ClusterResource
        key = `api/${resource.gvk().version}/namespaces/${resource.gvk().kindPlural}`;
      } else {
        // Extension ClusterResource
        key = `apis/${resource.gvk().group}/${resource.gvk().version}/${resource.gvk().kindPlural}`;
      }
    }
    return key;
  }

  private ensureDataLoaded() {
    let localData = JSON.parse(localStorage.getItem(localStorageMockedDataKey));
    if ((!localData) || (!localData.TIME_STAMP) || (localData.TIME_STAMP < mocked_data.TIME_STAMP)) {
      localStorage.setItem(localStorageMockedDataKey, JSON.stringify(mocked_data));
    }
    localData = JSON.parse(localStorage.getItem(localStorageMockedDataKey));
  }

  public static Instance() {
    return this.instance || (this.instance = new this(''));
  }

  public patchResource(resource: KubeResource, name: string, patch: object): object {
    const key = this.determineKey(resource, name);
    const currentResource = this.data()[key][name];
    const patchedObject = JsonMergePatch.apply(currentResource, patch);
    const localStorageData = {...mocked_data, ...patchedObject};
    localStorage.setItem(localStorageMockedDataKey, JSON.stringify(localStorageData));

    if (patchedObject) {
      return patchedObject;
    } else {
      return {};
    }
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
    const key = this.determineKey(resource, name);
    const currentResource = this.data()[key][name];
    return currentResource;
  }

  public listResource(resource: KubeResource): object {
    const key = this.determineKey(resource, name);
    const listOfResources = this.data()[key];

    if (listOfResources) {
      return Object.keys(listOfResources).map(k => listOfResources[k]);
    } else {
      return [];
    }
  }
}
