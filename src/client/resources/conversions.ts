export function createTokenSecret(
  name: string, namespace: string, rawToken: string,
) {
  // btoa => to base64, atob => from base64
  const encodedToken = btoa(rawToken);
  return {
    'apiVersion': 'v1',
    'data': {
      'token': encodedToken,
    },
    'kind': 'Secret',
    'metadata': {
      'name': name,
      'namespace': namespace,
    },
    'type': 'Opaque',
  };
}

export function tokenFromSecret(secret: any) {
  return atob(secret.data.token);
}

export function createClusterRegistryObj(
  name: string, namespace: string, serverAddress: string,
) {
  return {
    'apiVersion': 'clusterregistry.k8s.io/v1alpha1',
    'kind': 'Cluster',
    'metadata': {
      'name': name,
      'namespace': namespace,
    },
    'spec': {
      'kubernetesApiEndpoints': {
        'serverEndpoints': [
          {
            'clientCIDR': '0.0.0.0',
            'serverAddress': serverAddress,
          },
        ],
      },
    },
  };
}

export function createMigCluster(
  name: string, namespace: string, clusterRegistryObj: any, tokenSecret: any,
) {
  return {
    'apiVersion': 'migration.openshift.io/v1alpha1',
    'kind': 'MigCluster',
    'metadata': {
      'name': name,
      'namespace': namespace,
    },
    'spec': {
      'isHostCluster': false,
      'clusterRef': {
        'name': clusterRegistryObj.metadata.name,
        'namespace': clusterRegistryObj.metadata.namespace,
      },
      'serviceAccountSecretRef': {
        'name': tokenSecret.metadata.name,
        'namespace': tokenSecret.metadata.namespace,
      },
    },
  };
}
