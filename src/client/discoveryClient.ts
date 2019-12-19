import axios, { AxiosPromise, AxiosInstance, ResponseType } from 'axios';
import { IDiscoveryResource, IDiscoveryParameters } from './resources/common';
import moment = require('moment');
import { isTokenExpired, TokenExpiryHandler } from './client';

export interface IDiscoveryClient {
  get(resource: IDiscoveryResource, params?: object): Promise<any>;
  getRaw(path: string): Promise<any>;
  apiRoot(): string;
  rootNamespace(): string;
  setTokenExpiryHandler: (TokenExpiryHandler, number) => void;
}

export class DiscoveryClient implements IDiscoveryClient {
  private readonly _discoveryApi: string;
  private readonly _discoveryNamespace: string;
  private readonly _requester: AxiosInstance;
  private _token: string;
  private _tokenExpiryTime: number;
  private _tokenExpiryHandler: TokenExpiryHandler;

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
    this.checkExpiry();
    return this._get(this.fullPath(resource.path()), resource.parametrized(params));
  }

  public getRaw = (path: string): AxiosPromise<any> => {
    this.checkExpiry();
    return this._get(path);
  }

  private _get = (path: string, params?): AxiosPromise<any> => {
    return new Promise((resolve, reject) => {
      this._requester.get(path, params)
        .then(res => resolve(res))
        .catch(err => {
          if (err.response && err.response.status === 401) {
            this._tokenExpiryHandler(this.oldToken());
          } else {
            reject(err);
          }
        });
    });
  }

  private checkExpiry(): void {
    if (isTokenExpired(this._tokenExpiryTime) && this._tokenExpiryHandler) {
      this._tokenExpiryHandler(this.oldToken());
    }
  }


  public setTokenExpiryHandler(tokenExpiryHandler, expiry) {
    this._tokenExpiryTime = expiry;
    this._tokenExpiryHandler = tokenExpiryHandler;
  }

  private oldToken() {
    return {
      token: this._token,
      tokenExpiryTime: this._tokenExpiryTime,
    };
  }
}
