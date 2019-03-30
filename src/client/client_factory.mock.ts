import { MockClusterClient } from './client.mock';

export const ClientFactory = {
  hostCluster: (state: any) => {
    return new MockClusterClient('_host', state);
  },
  forCluster: (clusterName: string, state: any) => {
    return new MockClusterClient(clusterName, state);
  },
}
