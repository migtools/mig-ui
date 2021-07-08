import { useState, useEffect } from 'react';
import { INetworkContext, useNetworkContext } from '../app/common/context/NetworkContext';
import { IKubeResponse } from './types';
import { History, LocationState } from 'history';
import { useHistory } from 'react-router-dom';
import KubeClient, {
  ClientFactory,
  NamespacedResource,
  CoreNamespacedResourceKind,
  CoreNamespacedResource,
} from '@konveyor/lib-ui';
interface IAxiosContext {
  history: History<LocationState>;
  checkExpiry: INetworkContext['checkExpiry'];
}

export const useAxiosContext = (): IAxiosContext => ({
  history: useHistory(),
  checkExpiry: useNetworkContext().checkExpiry,
});

export const useClientInstance = (): KubeClient.ClusterClient => {
  const { currentUser } = useNetworkContext();
  const currentUserString = currentUser !== null ? JSON.parse(currentUser || '{}') : {};
  const user = {
    access_token: currentUserString.access_token,
    expiry_time: currentUserString.expiry_time,
  };
  return ClientFactory.cluster(user, '/cluster-api');
};

export const authorizedK8sRequest = async <T>(
  axiosContext: IAxiosContext,
  requestFn: () => Promise<IKubeResponse<T>>
): Promise<IKubeResponse<T>> => {
  const { history, checkExpiry } = axiosContext;

  try {
    const response = await requestFn();
    if (response && response.data) {
      return response;
    } else {
      throw response;
    }
  } catch (error) {
    checkExpiry(error, history);
    throw error;
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAuthorizedK8sClient = () => {
  const axiosContext = useAxiosContext();
  const client = useClientInstance();
  /* eslint-disable @typescript-eslint/ban-types */
  return {
    get: <T>(resource: KubeResource, name: string, params?: object) =>
      authorizedK8sRequest<T>(fetchContext, () => client.get(resource, name, params)),
    list: <T>(resource: KubeResource, params?: object) =>
      authorizedK8sRequest<T>(fetchContext, () => client.list(resource, params)),
    create: <T>(resource: KubeResource, newObject: object, params?: object) =>
      authorizedK8sRequest<T>(fetchContext, () => client.create(resource, newObject, params)),
    delete: <T = IKubeStatus>(resource: KubeResource, name: string, params?: object) =>
      authorizedK8sRequest<T>(fetchContext, () => client.delete(resource, name, params)),
    patch: <T>(resource: KubeResource, name: string, patch: object, params?: object) =>
      authorizedK8sRequest<T>(fetchContext, () => client.patch(resource, name, patch, params)),
    put: <T>(resource: KubeResource, name: string, object: object, params?: object) =>
      authorizedK8sRequest<T>(fetchContext, () => client.put(resource, name, object, params)),
  };
  /* eslint-enable @typescript-eslint/ban-types */
};

export type AuthorizedClusterClient = ReturnType<typeof useAuthorizedK8sClient>;
