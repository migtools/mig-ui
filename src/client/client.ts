import { KubeResource, OAuthClient, TokenExpiryHandler } from './resources/common';
import axios, { AxiosInstance, ResponseType } from 'axios';

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

export class ClusterClient extends OAuthClient {
  public apiRoot: string;
  private requester: AxiosInstance;
  private patchRequester: AxiosInstance;

  constructor(apiRoot: string, token: string, customResponseType: ResponseType = 'json') {
    super(token);
    this.apiRoot = apiRoot;
    this.requester = axios.create({
      baseURL: this.apiRoot,
      headers: {
        ...super.getOAuthHeader(),
        'Content-Type': 'application/json',
      },
      transformResponse: undefined,
      responseType: customResponseType,
    });
    this.patchRequester = axios.create({
      baseURL: this.apiRoot,
      headers: {
        ...super.getOAuthHeader(),
        'Content-Type': 'application/merge-patch+json',
      },
      responseType: customResponseType,
    });
  }

  public list = (resource: KubeResource, params?: object): Promise<any> => {
    try {
      return this.requester.get(resource.listPath(), { params });
    } catch (err) {
      super.checkExpiry(err);
      throw err;
    }
  }

  public get = (resource: KubeResource, name: string, params?: object): Promise<any> => {
    try {
      return this.requester.get(resource.namedPath(name), { params });
    } catch (err) {
      super.checkExpiry(err);
      throw err;
    }
  }

  public put = (
    resource: KubeResource,
    name: string,
    updatedObject: object,
    params?: object
  ): Promise<any> => {
    try {
      return this.requester.put(resource.namedPath(name), updatedObject, { params });
    } catch (err) {
      super.checkExpiry(err);
      throw err;
    }
  }

  public patch = (resource: KubeResource, name: string, patch: object, params?: object): Promise<any> => {
    try {
      return this.patchRequester.patch(resource.namedPath(name), patch, { params });
    } catch (err) {
      super.checkExpiry(err);
      throw err;
    }
  }

  public create = (resource: KubeResource, newObject: object, params?: object): Promise<any> => {
    try {
      return this.requester.post(resource.listPath(), newObject, { params });
    } catch (err) {
      super.checkExpiry(err);
      throw err;
    }
  }

  public delete = (resource: KubeResource, name: string, params?: object): Promise<any> => {
    try {
      return this.requester.delete(resource.namedPath(name), { params });
    } catch (err) {
      super.checkExpiry(err);
      throw err;
    }
  }

}
