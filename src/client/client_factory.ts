import { ClusterClient, TokenExpiryHandler } from './client';
import { ResponseType } from 'axios';

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
  hostCluster: (state: any, customResponceType: ResponseType = 'json') => {
    if (!state.auth.user) {
      throw new ClientFactoryMissingUserError();
    }
    if (!state.migMeta.clusterApi) {
      throw new ClientFactoryMissingApiRoot();
    }

    const newClient = new ClusterClient(
      state.migMeta.clusterApi, state.auth.user.access_token, true /*isOauth*/, customResponceType);

    if(tokenExpiryHandler) {
      newClient.setTokenExpiryHandler(tokenExpiryHandler, state.auth.user.expiry_time);
    }

    return newClient;
  },
  forCluster: (clusterName: string, state: any, customResponceType: ResponseType = 'json') => {
    const { clusterApi, accessToken } = getAuthForCluster(clusterName, state);
    const newClient = new ClusterClient(clusterApi, accessToken, false /*isOauth*/, customResponceType);
    return newClient;
  },
};

interface IAuthDetails {
  clusterApi: string;
  accessToken: string;
}

function getAuthForCluster(clusterName: string, state: any): IAuthDetails {
  const cluster = state.cluster.clusterList.find(c => c.MigCluster.metadata.name === clusterName);
  if (!cluster) {
    throw new ClientFactoryUnknownClusterError(clusterName);
  }
  const clusterApi = cluster.Cluster.spec.kubernetesApiEndpoints.serverEndpoints[0].serverAddress;
  const accessToken = atob(cluster.Secret.data.token || cluster.Secret.data.saToken);

  return { clusterApi, accessToken };
}

let tokenExpiryHandler = null;

export const setTokenExpiryHandler = (newExpiryHandler: TokenExpiryHandler) => {
  tokenExpiryHandler = newExpiryHandler;
};
