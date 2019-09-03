import { KubeResource } from './resources/common';
import axios, { AxiosPromise, AxiosInstance, ResponseType } from 'axios';
import moment from 'moment';

export type TokenExpiryHandler = (oldToken: object) => void;

export interface IClusterClient {
  list(resource: KubeResource, params?: object): Promise<any>;
  get(resource: KubeResource, name: string, params?: object): Promise<any>;
  put(resource: KubeResource, name: string, updatedObject: object, params?: object): Promise<any>;
  patch(resource: KubeResource, name: string, patch: object, params?: object): Promise<any>;
  create(resource: KubeResource, newObject: object, params?: object): Promise<any>;
  delete(resource: KubeResource, name: string, params?: object): Promise<any>;
  apiRoot: string;
  setTokenExpiryHandler: (TokenExpiryHandler, number) => void;
}

export class ClientTokenExpiredError extends Error {
  constructor() {
    super('The api token has expired');
    Object.setPrototypeOf(this, ClientTokenExpiredError.prototype);
  }
}

export class ClusterClient {
  private token: string;
  public apiRoot: string;
  private requester: AxiosInstance;
  private patchRequester: AxiosInstance;
  private tokenExpiryHandler: TokenExpiryHandler;
  private tokenExpiryTime: number;
  private isOauth: boolean;

  constructor(apiRoot: string, token: string, isOauth: boolean, customResponseType: ResponseType = 'json') {
    this.apiRoot = apiRoot;
    this.token = token;
    this.isOauth = isOauth;
    this.requester = axios.create({
      baseURL: this.apiRoot,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      transformResponse: undefined,
      responseType: customResponseType,
    });
    this.patchRequester = axios.create({
      baseURL: this.apiRoot,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/merge-patch+json',
      },
      responseType: customResponseType,
    });
  }

  public setTokenExpiryHandler(handler: TokenExpiryHandler, tokenExpiryTime: number) {
    this.tokenExpiryHandler = handler;
    this.tokenExpiryTime = tokenExpiryTime;
  }

  public list = (resource: KubeResource, params?: object): AxiosPromise<any> => {
    this.checkExpiry();
    return new Promise((resolve, reject) => {
      this.requester.get(resource.listPath(), { params })
        .then(res => resolve(res))
        .catch(err => {
          if(err.response && err.response.status === 401 && this.isOauth) {
            this.tokenExpiryHandler(this.oldToken());
          } else {
            reject(err);
          }
        });
    });
  }
  public get = (resource: KubeResource, name: string, params?: object): AxiosPromise<any> => {
    this.checkExpiry();
    return new Promise((resolve, reject) => {
      this.requester.get(resource.namedPath(name), { params })
        .then(res => resolve(res))
        .catch(err => {
          if(err.response && err.response.status === 401 && this.isOauth) {
            this.tokenExpiryHandler(this.oldToken());
          } else {
            reject(err);
          }
        });
    });
  }
  public put = (
      resource: KubeResource,
      name: string,
      updatedObject: object,
      params?: object
    ): AxiosPromise<any> => {
    this.checkExpiry();
    return new Promise((resolve, reject) => {
      this.requester.put(resource.namedPath(name), updatedObject, { params })
        .then(res => resolve(res))
        .catch(err => {
          if(err.response && err.response.status === 401 && this.isOauth) {
            this.tokenExpiryHandler(this.oldToken());
          } else {
            reject(err);
          }
        });
    });
  }
  public patch = (resource: KubeResource, name: string, patch: object, params?: object): AxiosPromise<any> => {
    this.checkExpiry();
    return new Promise((resolve, reject) => {
      this.patchRequester.patch(resource.namedPath(name), patch, { params })
        .then(res => resolve(res))
        .catch(err => {
          if(err.response && err.response.status === 401 && this.isOauth) {
            this.tokenExpiryHandler(this.oldToken());
          } else {
            reject(err);
          }
        });
    });
  }
  public create = (resource: KubeResource, newObject: object, params?: object): AxiosPromise<any> => {
    this.checkExpiry();
    return new Promise((resolve, reject) => {
      this.requester.post(resource.listPath(), newObject, { params })
        .then(res => resolve(res))
        .catch(err => {
          if(err.response && err.response.status === 401 && this.isOauth) {
            this.tokenExpiryHandler(this.oldToken());
          } else {
            reject(err);
          }
        });
    });
  }
  public delete = (resource: KubeResource, name: string, params?: object): AxiosPromise<any> => {
    this.checkExpiry();
    return new Promise((resolve, reject) => {
      this.requester.delete(resource.namedPath(name), { params })
        .then(res => resolve(res))
        .catch(err => {
          if(err.response && err.response.status === 401 && this.isOauth) {
            this.tokenExpiryHandler(this.oldToken());
          } else {
            reject(err);
          }
        });
    });
  }

  private checkExpiry() {
    if(this.isTokenExpired() && this.tokenExpiryHandler) {
      this.tokenExpiryHandler(this.oldToken());
    }
  }

  private isTokenExpired() {
    const currentUnixTime = moment().unix();
    const expiredTime = this.tokenExpiryTime;
    const isExpired = currentUnixTime > expiredTime;

    if(isExpired) {
      console.warn('Client token appears to be expired:');
      console.warn(`Current time: ${currentUnixTime}`);
      console.warn(`Token expiry time: ${expiredTime}`);
    }

    return isExpired;
  }

  private oldToken() {
    return {
      token: this.token,
      tokenExpiryTime: this.tokenExpiryTime,
    };
  }
}
