import { NamedDiscoveryResource, DiscoveryResource, IDiscoveryParameters } from './common';
import { IDiscoveryClient } from '../discoveryClient';
import { IPlanReport, INamespaceList } from './convension';

export class NamespaceDiscovery extends DiscoveryResource {
  constructor(cluster: string, params: IDiscoveryParameters = {}) {
    super(cluster, 'namespaces', params);
  }

  public async get(client: IDiscoveryClient): Promise<INamespaceList> {
    const ns = await client.get(this);
    return ns.data;
  }
}

export class PersistentVolumesDiscovery extends DiscoveryResource {
  constructor(cluster: string, params: IDiscoveryParameters = {}) {
    super(cluster, 'persistentvolumes', params);
  }

  public async get(client: IDiscoveryClient) {
    const pv = await client.get(this);
    return pv.data;
  }
}

export class PersistentVolumeDiscovery extends NamedDiscoveryResource {
  constructor(name: string, cluster: string, params: IDiscoveryParameters = {}) {
    super(name, cluster, 'persistentvolumes', params);
  }

  public async get(client: IDiscoveryClient): Promise<any[]> {
    const pvs = await client.get(this);
    return pvs.data;
  }
}

export class PlanPodReportDiscovery extends DiscoveryResource {
  constructor(planName: string, params: IDiscoveryParameters = {}) {
    super(planName, 'pods', params, 'plans');
  }

  public async get(client: IDiscoveryClient): Promise<IPlanReport> {
    const report = await client.get(this);
    return report.data;
  }
}


