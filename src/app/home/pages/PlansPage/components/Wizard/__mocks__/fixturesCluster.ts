import { ICluster } from '../../../../../../cluster/duck/types';

export const clusterExample1: ICluster = {
  ClusterStatus: {
    hasReadyCondition: true,
  },
  MigCluster: {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigCluster',
    metadata: {
      creationTimestamp: '2020-06-24T07:43:26Z',
      generation: 4,
      name: 'ocp311',
      namespaces: ['openshift-migration'],
      resourceVersion: '6259149',
      selfLink: '',
      uid: '73eea1b4-0ca0-4286-a2fd-9b7d35a464a1',
      labels: {
        'controller-ToolsIcon.k8s.io': 1,
        'migrations.openshift.io/migration-group': '',
      },
    },
    spec: {
      serviceAccountSecretRef: {
        name: '',
        namespace: '',
      },
      clusterUrl: '',
      azureResourceGroup: '',
      caBundle: '',
      insecure: true,
      isHostCluster: false,
      url: '',
    },
    status: {
      conditions: [
        {
          category: 'Required',
          lastTransitionTime: '2020-06-26T06:55:41Z',
          message: 'The cluster is ready.',
          status: 'True',
          type: 'Ready',
        },
      ],
      observedDigest: '',
    },
    id: '',
  },
  Secret: {
    data: {
      saToken: 'saToken',
    },
  },
};

export const clusterExample2: ICluster = {
  ClusterStatus: {
    hasReadyCondition: true,
  },
  MigCluster: {
    apiVersion: 'migration.openshift.io/v1alpha1',
    kind: 'MigCluster',
    metadata: {
      creationTimestamp: '2020-06-23T13:45:05Z',
      generation: 2,
      name: 'host',
      namespaces: ['openshift-migration'],
      resourceVersion: '6151682',
      selfLink: '',
      uid: '5a326e14-4222-4d73-b5ff-a97a7da209a1',
      labels: {
        'controller-ToolsIcon.k8s.io': 1,
        'migrations.openshift.io/migration-group': '',
      },
    },
    spec: {
      serviceAccountSecretRef: {
        name: '',
        namespace: '',
      },
      clusterUrl: '',
      azureResourceGroup: '',
      caBundle: '',
      insecure: true,
      isHostCluster: true,
      url: '',
    },
    status: {
      conditions: [
        {
          category: 'Required',
          lastTransitionTime: '2020-06-23T13:45:15Z',
          message: 'The cluster is ready.',
          status: 'True',
          type: 'Ready',
        },
      ],
      observedDigest: '',
    },
    id: '',
  },
  Secret: {
    data: {
      saToken: 'saToken',
    },
  },
};
