import axios, { AxiosPromise, AxiosInstance, ResponseType } from 'axios';
import { IDiscoveryResource, IDiscoveryParameters } from './resources/common';

export interface IDiscoveryClient {
  get(resource: IDiscoveryResource, params?: object): Promise<any>;
  apiRoot(): string;
  rootNamespace(): string;
}

export class DiscoveryClient implements IDiscoveryClient {
  private _token: string;
  private readonly _discoveryApi: string;
  private readonly _discoveryNamespace: string;
  private readonly _requester: AxiosInstance;

  constructor(
    discoveryApi: string,
    discoveryNamespace: string,
    token: string,
    customResponseType: ResponseType = 'json') {

    this._discoveryApi = discoveryApi;
    this._discoveryNamespace = discoveryNamespace;
    this._token = token;
    const headers = {
      Authorization: `Bearer ${this._token}`,
      'Content-Type': 'application/json',
    };
    this._requester = axios.create({
      baseURL: this._discoveryApi,
      headers,
      responseType: customResponseType,
    });
  }

  public rootNamespace() {
    return ['namespaces', this._discoveryNamespace].join('/');
  }

  public apiRoot() {
    return [this._discoveryApi, this.rootNamespace()].join('/');
  }

  private fullPath(resourcePath: string): string {
    return [this.rootNamespace(), resourcePath].join('/');
  }

  public get = (resource: IDiscoveryResource, params?: IDiscoveryParameters): AxiosPromise<any> => {
    return new Promise((resolve, reject) => {
      this._requester.get(this.fullPath(resource.path()), resource.parametrized(params))
        .then(res => resolve(res))
        .catch(err => {
          reject(err);
        });
    });
  }
}
