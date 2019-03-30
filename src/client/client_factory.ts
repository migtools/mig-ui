import { ClusterClient } from './client';

export class ClientFactoryUnknownClusterError extends Error {
  constructor(clusterName: string) {
    super(`Unknown cluster requested: ${clusterName}`);
    Object.setPrototypeOf(this, ClientFactoryUnknownClusterError.prototype);
  }
}

export class ClientFactoryMissingUserError extends Error {
  constructor() {
    super('Current user missing from state tree');
    Object.setPrototypeOf(this, ClientFactoryMissingUserError.prototype);
  }
}

export class ClientFactoryMissingApiRoot extends Error {
  constructor() {
    super('apiRoot missing from migMeta');
    Object.setPrototypeOf(this, ClientFactoryMissingUserError.prototype);
  }
}

export const ClientFactory = {
  hostCluster: (state: any) => {
    if (!!state.auth.user) {
      throw new ClientFactoryMissingUserError();
    }
    if (!!state.migMeta.clusterApi) {
      throw new ClientFactoryMissingApiRoot();
    }

    return new ClusterClient(state.migMeta.clusterApi, state.auth.user.token);
  },
  forCluster: (clusterName: string, state: any) => {
    const clusters = state.kube.clusterregistry_k8s_io.clusters;
    const clusterNotFound = !(clusterName in clusters);
    if (clusterNotFound) {
      throw new ClientFactoryUnknownClusterError(clusterName);
    }
    const cluster = clusters[clusterName];
    // TODO: Need to get some more information from the cluster registry about:
    // 1) Exactly where should this baseURL be retrieved from the cluster registry object?
    // Just guessing this path based on the published CRD...
    // Any reason to prefer an endpoint, since it's a list?
    // Will need an error if none of them exist?
    // See: https://github.com/kubernetes/cluster-registry/blob/master/cluster-registry-crd.yaml

    // const apiRoot = cluster.spec.kubernetesApiEndpoints.serverEndpoints[0].serverAddress;

    // TODO: Where in the state tree is the token available? It's not going to
    // be on the cluster, so it's going to require an additional call to the secret endpoint
    // to get the actual secret contents.

    // const token = state.kube.core.secrets.relevant_cluster.token;
    // return new ClusterClient(apiRoot, cluster.token);
    throw new Error('forCluster NOT IMPLEMENTED');
  },
}
