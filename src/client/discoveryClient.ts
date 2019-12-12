import axios, { AxiosPromise, AxiosInstance, ResponseType } from 'axios';
import { ClusterDiscoveryResource } from './resources/common';

export interface IDiscoveryClient {
  get(resource: ClusterDiscoveryResource, params?: object): Promise<any>;
}

export class DiscoveryClient {
  private token: string;
  public discoveryApi: string;
  private _discoveryNamespace: string;
  private requester: AxiosInstance;

  constructor(
    discoveryApi: string,
    discoveryNamespace: string,
    token?: string,
    customResponseType: ResponseType = 'json') {

    this.discoveryApi = discoveryApi;
    this._discoveryNamespace = discoveryNamespace;
    this.token = token;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    this.requester = axios.create({
      baseURL: [this.discoveryApi, 'namespaces', this._discoveryNamespace].join('/'),
      headers,
      responseType: customResponseType,
    });
  }

  public get = (resource: ClusterDiscoveryResource, params?: object): AxiosPromise<any> => {
    return new Promise((resolve, reject) => {
      this.requester.get(resource.for(), { ...resource.parametrizedPath(params) })
        .then(res => resolve(res))
        .catch(err => {
          reject(err);
        });
    });
  }
}
