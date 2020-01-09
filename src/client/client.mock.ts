import { KubeResource } from './resources';
import { KubeStore } from './kube_store';
import { TokenExpiryHandler } from './resources/common';

export class MockClusterClient {
  private name: string;
  private state: object;
  private kube_store: KubeStore;
  private reqTime = 500;
  private tokenExpiryHandler: TokenExpiryHandler;
  private tokenExpiryTime: number;
  public apiRoot: string;

  constructor(name: string, state: object) {
    this.name = name;
    this.kube_store = new KubeStore(name);
    this.state = state;
    this.apiRoot = 'http://mock-api.biz';
  }

  public setTokenExpiryHandler(handler: TokenExpiryHandler, tokenExpiryTime: number) {
    this.tokenExpiryHandler = handler;
    this.tokenExpiryTime = tokenExpiryTime;
  }

  public list(resource: KubeResource): Promise<any> {
    return new Promise<any>((res, rej) => {
      setTimeout(() => {
        res({
          data: {
            items: this.kube_store.listResource(resource),
          },
        });
      }, this.reqTime);
    });
  }

  public get(resource: KubeResource, name: string): Promise<any> {
    return new Promise<any>((res, rej) => {
      setTimeout(() => {
        res({
          data: this.kube_store.getResource(resource, name),
        });
      }, this.reqTime);
    });
  }

  public put = (resource: KubeResource, name: string, updatedObject: object): Promise<any> =>
    this.create(resource, updatedObject);

  public patch(resource: KubeResource, name: string, patch: object): Promise<any> {
    return new Promise<any>((res, rej) => {
      setTimeout(() => {
        res({
          data: this.kube_store.patchResource(resource, name, patch)
        });
      }, this.reqTime);
    });
  }

  public create(resource: KubeResource, newObject: any): Promise<any> {
    return new Promise<any>((res, rej) => {
      setTimeout(() => {
        res({
          data: this.kube_store.setResource(resource, newObject.metadata.name, newObject),
        });
      }, this.reqTime);
    });
  }

  public delete(resource: KubeResource, name: string): Promise<any> {
    return new Promise<any>((res, rej) => {
      setTimeout(() => {
        res({
          data: this.kube_store.deleteResource(resource, name),
        });
      }, this.reqTime);
    });
  }
}
