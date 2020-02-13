import { ClusterClient } from './client';
import { DiscoveryClient } from './discoveryClient';
import { ResponseType } from 'axios';
import { TokenExpiryHandler } from './resources/common';

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

export class ClientFactoryMissingDiscoveryApi extends Error {
  constructor() {
    super('migMeta.discoveryApi is missing');
    Object.setPrototypeOf(this, ClientFactoryMissingDiscoveryApi.prototype);
  }
}

let tokenExpiryHandler = null;
export const ClientFactory = {
  cluster: (state: any, customResponseType: ResponseType = 'json') => {
    if (!state.auth.user) {
      throw new ClientFactoryMissingUserError();
    }
    if (!state.migMeta.clusterApi) {
      throw new ClientFactoryMissingApiRoot();
    }

    const newClient = new ClusterClient(
      state.migMeta.clusterApi, state.auth.user.access_token, customResponseType);

    if (tokenExpiryHandler) {
      newClient.setTokenExpiryHandler(tokenExpiryHandler, state.auth.user.expiry_time);
    }

    return newClient;
  },
  discovery: (state: any, customResponseType: ResponseType = 'json') => {
    if (!state.auth.user) {
      throw new ClientFactoryMissingUserError();
    }
    if (!state.migMeta.discoveryApi) {
      throw new ClientFactoryMissingDiscoveryApi();
    }

    const discoveryClient = new DiscoveryClient(
      state.migMeta.discoveryApi,
      state.migMeta.namespace,
      state.auth.user.access_token,
      customResponseType);

    if (tokenExpiryHandler) {
      discoveryClient.setTokenExpiryHandler(tokenExpiryHandler, state.auth.user.expiry_time);
    }
    return discoveryClient;
  }
};


export const setTokenExpiryHandler = (newExpiryHandler: TokenExpiryHandler) => {
  tokenExpiryHandler = newExpiryHandler;
};
