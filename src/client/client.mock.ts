import { KubeResource } from './resources';
import KubeStore from './kube_store';

export class MockClusterClient {
  private name: string;
  private state: object;
  private reqTime = 500;

  constructor(name: string, state: object) {
    this.name = name;
    this.state = state;
  }

  public list(resource: KubeResource): Promise<any> {
    return new Promise<any>((res, rej) => {
      setTimeout(() => {
        res({
          data: KubeStore.Instance.listResource(resource),
        });
      }, this.reqTime);
    });
  }

  public get(resource: KubeResource, name: string): Promise<any> {
    return new Promise<any>((res, rej) => {
      setTimeout(() => {
        res({
          data: KubeStore.Instance.getResource(resource, name),
        });
      }, this.reqTime);
    });
  }

  public patch(resource: KubeResource, name: string, patch: object): Promise<any> {
    return new Promise<any>((res, rej) => {
      res({
      });
    });
  }

  public create(resource: KubeResource, newObject: object): Promise<any> {
    return new Promise<any>((res, rej) => {
      setTimeout(() => {
        res({
          data: KubeStore.Instance.setResource(resource, name, newObject),
        });
      }, this.reqTime);
    });
  }

  public delete(resource: KubeResource, name: string): Promise<any> {
    return new Promise<any>((res, rej) => {
      res({
      });
    });
  }
}

