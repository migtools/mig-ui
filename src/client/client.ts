import { KubeResource } from './resources/common';
import axios, { AxiosPromise, AxiosInstance } from 'axios';
import moment from 'moment';

export type TokenExpiryHandler = (oldToken: object) => void;

export interface IClusterClient {
  list(resource: KubeResource): Promise<any>;
  get(resource: KubeResource, name: string): Promise<any>;
  put(resource: KubeResource, name: string, updatedObject: object): Promise<any>;
  patch(resource: KubeResource, name: string, patch: object): Promise<any>;
  create(resource: KubeResource, newObject: object): Promise<any>;
  delete(resource: KubeResource, name: string): Promise<any>;
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

  constructor(apiRoot: string, token: string) {
    this.apiRoot = apiRoot;
    this.token = token;
    this.requester = axios.create({
      baseURL: this.apiRoot,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    });
    this.patchRequester = axios.create({
      baseURL: this.apiRoot,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/merge-patch+json',
      },
      responseType: 'json',
    });
  }

  public setTokenExpiryHandler(handler: TokenExpiryHandler, tokenExpiryTime: number) {
    this.tokenExpiryHandler = handler;
    this.tokenExpiryTime = tokenExpiryTime;
  }

  public list(resource: KubeResource): AxiosPromise<any> {
    this.checkExpiry();
    return this.requester.get(resource.listPath());
  }
  public get(resource: KubeResource, name: string): AxiosPromise<any> {
    this.checkExpiry();
    return this.requester.get(resource.namedPath(name));
  }
  public put(resource: KubeResource, name: string, updatedObject: object): AxiosPromise<any> {
    this.checkExpiry();
    return this.requester.put(resource.namedPath(name), updatedObject);
  }
  public patch(resource: KubeResource, name: string, patch: object): AxiosPromise<any> {
    this.checkExpiry();
    return this.patchRequester.patch(resource.namedPath(name), patch);
  }
  public create(resource: KubeResource, newObject: object): AxiosPromise<any> {
    this.checkExpiry();
    return this.requester.post(resource.listPath(), newObject);
  }
  public delete(resource: KubeResource, name: string): AxiosPromise<any> {
    this.checkExpiry();
    return this.requester.delete(resource.namedPath(name));
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
