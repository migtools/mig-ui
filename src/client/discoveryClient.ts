import axios, { AxiosPromise, AxiosInstance, ResponseType } from 'axios';
import { DiscoveryResource } from './resources/common';

export interface IDiscoveryClient {
  get(resource: DiscoveryResource, params?: object): Promise<any>;
}

export class DiscoveryClient {
  private token: string;
  public discoveryApi: string;
  private requester: AxiosInstance;

  constructor(discoveryApi: string, customResponseType: ResponseType = 'json', token?: string) {
    this.discoveryApi = discoveryApi;
    this.token = token;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    this.requester = axios.create({
      baseURL: this.discoveryApi,
      headers,
      responseType: customResponseType,
    });
  }

  public get = (resource: DiscoveryResource, params?: object): AxiosPromise<any> => {
    params = {
      ...resource.for(),
      ...resource.parametrizedPath(params)
    };
    return new Promise((resolve, reject) => {
      this.requester.get(resource.type, { params })
        .then(res => resolve(res))
        .catch(err => {
          reject(err);
        });
    });
  }
}
