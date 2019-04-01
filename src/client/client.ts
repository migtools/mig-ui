import { KubeResource } from './resources/common';
import axios, { AxiosPromise, AxiosInstance } from 'axios';

export interface IClusterClient {
  list(resource: KubeResource): Promise<any>;
  get(resource: KubeResource, name: string): Promise<any>;
  patch(resource: KubeResource, name: string, patch: object): Promise<any>;
  create(resource: KubeResource, newObject: object): Promise<any>;
  delete(resource: KubeResource, name: string): Promise<any>;
}

export class ClusterClient {
  private token: string;
  private apiRoot: string;
  private requester: AxiosInstance;

  constructor(apiRoot: string, token: string) {
    this.apiRoot = apiRoot;
    this.token = token;
    this.requester = axios.create({
      baseURL: this.apiRoot,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    });
  }

  public list(resource: KubeResource): AxiosPromise<any> {
    return this.requester.get(resource.listPath());
  }
  public get(resource: KubeResource, name: string): AxiosPromise<any> {
    return this.requester.get(resource.namedPath(name));
  }
  public patch(resource: KubeResource, name: string, patch: object): AxiosPromise<any> {
    return this.requester.patch(resource.namedPath(name), patch);
  }
  public create(resource: KubeResource, newObject: object): AxiosPromise<any> {
    return this.requester.post(resource.listPath(), newObject);
  }
  public delete(resource: KubeResource, name: string): AxiosPromise<any> {
    return this.requester.delete(resource.namedPath(name));
  }
}

