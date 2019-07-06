import { MockClusterClient } from './client.mock';
import mocked_data from './kube_store/mocked_data';

function determineHostClusterName() {
  return mocked_data['hostMigClusterName'];
}

export const ClientFactory = {
  hostCluster: (state: any) => {
    return new MockClusterClient(determineHostClusterName(), state);
  },
  forCluster: (clusterName: string, state: any) => {
    return new MockClusterClient(clusterName, state);
  },
};
