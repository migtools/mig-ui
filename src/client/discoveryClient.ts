import axios, { AxiosPromise, AxiosInstance, ResponseType } from 'axios';
import { ClusterDiscoveryResource, IDiscoveryParameters } from './resources/common';

export interface IDiscoveryClient {
  get(resource: ClusterDiscoveryResource, params?: object): Promise<any>;
}

export class DiscoveryClient {
  private _token: string;
  private _discoveryApi: string;
  private _discoveryNamespace: string;
  private _requester: AxiosInstance;

  constructor(
    discoveryApi: string,
    discoveryNamespace: string,
    token: string,
    customResponseType: ResponseType = 'json') {

    this._discoveryApi = discoveryApi;
    this._discoveryNamespace = discoveryNamespace;
    this._token = token;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this._token}`,
    };
    this._requester = axios.create({
      baseURL: [this._discoveryApi, 'namespaces', this._discoveryNamespace].join('/'),
      headers,
      responseType: customResponseType,
    });
  }

  public get = (resource: ClusterDiscoveryResource, params?: IDiscoveryParameters): AxiosPromise<any> => {
    return new Promise((resolve, reject) => {
      this._requester.get(resource.for(), resource.parametrized(params))
        .then(res => resolve(res))
        .catch(err => {
          reject(err);
        });
    });
  }
}
