import _ from 'lodash';
import { KubeResource } from '../resources';

import mocked_data from './mocked_data';
import JsonMergePatch from 'json-merge-patch';

export const LocalStorageMockedDataKey = 'CAM_MOCKED_DATA';

export class KubeStore {
  private static instance: KubeStore;
  private clusterName: string;

  public constructor(clusterName) {
    this.clusterName = clusterName;
    this.ensureDataLoaded();
  }

  private _data() {
    // Returns the chunk of data relevant for mocking data from this k8s cluster
    // All subsequent calls will use this data to lookup their responses
    const d = JSON.parse(localStorage.getItem(LocalStorageMockedDataKey));
    if (! ('clusters' in d)) {
      alert('Unable to find expected mocked data for "clusters"');
      return {};
    }
    // Returning a new copy of data on each call to limit unintentional changes
    return {...d};
  }

  private data() {
    // Focused on returning just the data for 'clusterName'
    const d = this._data();
    if (! (this.clusterName in d['clusters'])) {
      alert('Unable to find expected mocked data for clusterName "' + this.clusterName + '"');
      return {};
    }
   return d['clusters'][this.clusterName]; 
  }

  private ensureDataLoaded() {
    let localData = JSON.parse(localStorage.getItem(LocalStorageMockedDataKey));
    if ((!localData) || (!localData.TIME_STAMP) || (localData.TIME_STAMP < mocked_data.TIME_STAMP)) {
      localStorage.setItem(LocalStorageMockedDataKey, JSON.stringify(mocked_data));
    }
    localData = JSON.parse(localStorage.getItem(LocalStorageMockedDataKey));
  }

  private updateMockedData(apiKey, resourceName, updatedObject) {
    const newData = this._data();
    newData.clusters[this.clusterName][apiKey][resourceName] = updatedObject;
    localStorage.setItem(LocalStorageMockedDataKey, JSON.stringify(newData));
  }

  private createMockedData(apiKey, resourceName, obj) {
    const newData = this._data();
    const newObj = { [resourceName]: obj};
    newData.clusters[this.clusterName][apiKey] = {
      ...newData.clusters[this.clusterName][apiKey],
      ...newObj};
    localStorage.setItem(LocalStorageMockedDataKey, JSON.stringify(newData));
  }

  private deleteMockedData(apiKey, resourceName) {
    const newData = this._data();
    delete newData.clusters[this.clusterName][apiKey][resourceName];
    localStorage.setItem(LocalStorageMockedDataKey, JSON.stringify(newData));
  }

  public static Instance() {
    return this.instance || (this.instance = new this(''));
  }

  public patchResource(resource: KubeResource, name: string, patch: object): object {
    const apiKey = resource.listPath().substr(1);
    const mockedObject = { ...this.data()[apiKey][name] };
    const patchedReturn = JsonMergePatch.apply(mockedObject, patch);
    this.updateMockedData(apiKey, name, patchedReturn);
    return patchedReturn;
  }

  public setResource(resource: KubeResource, name: string, newObject: object): object {
    const apiKey = resource.listPath().substr(1);
    this.createMockedData(apiKey, name, newObject);
    return newObject;
  }

  public getResource(resource: KubeResource, name: string): object {
    const apiKey = resource.listPath().substr(1);
    const resourceObj = this.data()[apiKey][name];
    return resourceObj;
  }

  public listResource(resource: KubeResource): object {
    const apiKey = resource.listPath().substr(1);
    const resourceObjList = this.data()[apiKey];
    return Object.values(resourceObjList);
  }

  public deleteResource(resource: KubeResource, name: string): object {
    const apiKey = resource.listPath().substr(1);
    this.deleteMockedData(apiKey, name);
    return {};
  }
}
