import axios, { AxiosPromise, AxiosInstance, ResponseType } from 'axios';
import { IDiscoveryResource, IDiscoveryParameters, OAuthClient } from './resources/common';

export interface IDiscoveryClient {
  get(resource: IDiscoveryResource, params?: object): Promise<any>;
  getRaw(path: string): Promise<any>;
  apiRoot(): string;
  rootNamespace(): string;
  setTokenExpiryHandler: (TokenExpiryHandler, number) => void;
}

export class DiscoveryClient extends OAuthClient implements IDiscoveryClient {
  private readonly _discoveryApi: string;
  private readonly _discoveryNamespace: string;
  private readonly _requester: AxiosInstance;

  constructor(
    discoveryApi: string,
    discoveryNamespace: string,
    token: string,
    customResponseType: ResponseType = 'json') {
    super(token);
    this._discoveryApi = discoveryApi;
    this._discoveryNamespace = discoveryNamespace;
    const headers = {
      ...super.getOAuthHeader()
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
    return this._get(this.fullPath(resource.path()), resource.parametrized(params));
  }

  public getRaw = (path: string): AxiosPromise<any> => {
    return this._get(path);
  }

  private _get = (path: string, params?): AxiosPromise<any> => {
    return new Promise((resolve, reject) => {
      this._requester.get(path, params)
        .then(res => resolve(res))
        .catch(err => {
          super.checkExpiry(err);
          reject(err);
        });
    });
  }
}
