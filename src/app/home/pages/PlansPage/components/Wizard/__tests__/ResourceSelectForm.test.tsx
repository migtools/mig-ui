import { render, fireEvent, waitFor } from '@testing-library/react';
import ResourceSelectForm, { IResourceSelectFormProps } from '../ResourceSelectForm';
import React, { useEffect } from 'react';
import '@testing-library/jest-dom/extend-expect';

const defaultProps: IResourceSelectFormProps = {
  fetchNamespacesRequest() {
    return;
  },
  setFieldTouched() {
    return;
  },
  setFieldValue() {
    return;
  },
  touched: {
    planName: true,
  },
  isEdit: false,
  isFetchingNamespaceList: false,
  sourceClusterNamespaces: [],
  storageList: [],
  values: {
    persistentVolumes: [],
    planName: 'test',
    pvCopyMethodAssignment: {},
    pvStorageClassAssignment: {},
    pvVerifyFlagAssignment: {},
    selectedNamespaces: [],
    selectedStorage: '',
    sourceCluster: '',
    targetCluster: '',
  },
  errors: {},
  clusterList: [],
};

const clusterListProps = {
  clusterList: [
    {
      ClusterStatus: {
        hasReadyCondition: true,
      },
      MigCluster: {
        apiVersion: 'migration.openshift.io/v1alpha1',
        kind: 'MigCluster',
        metadata: {
          name: 'ocp311',
          namespaces: ['openshift-migration'],
          creationTimestamp: '',
          generation: 1,
          labels: {
            'controller-ToolsIcon.k8s.io': 0,
            'migrations.openshift.io/migration-group': '',
          },
          resourceVersion: '',
          selfLink: '',
          uid: '',
        },
        spec: {
          insecure: true,
          isHostCluster: false,
          url: 'https://master.ocp311.mg.dog8code.com',
          clusterAuthSecretRef: {
            name: 'ocp311-cslk4',
            namespace: 'openshift-config',
          },
          clusterUrl: '',
          storageClasses: [],
          azureResourceGroup: '',
          caBundle: '',
        },
        status: {
          conditions: [],
          observedDigest: '',
        },
        id: '',
      },
    },
    {
      ClusterStatus: {
        hasReadyCondition: true,
      },
      MigCluster: {
        apiVersion: 'migration.openshift.io/v1alpha1',
        kind: 'MigCluster',
        metadata: {
          name: 'host',
          namespaces: ['openshift-migration'],
          creationTimestamp: '',
          generation: 1,
          labels: {
            'controller-ToolsIcon.k8s.io': 0,
            'migrations.openshift.io/migration-group': '',
          },
          resourceVersion: '',
          selfLink: '',
          uid: '',
        },
        spec: {
          isHostCluster: true,
          storageClasses: [{ name: 'gp2', provisioner: 'kubernetes.io/aws-ebs' }],
          insecure: true,
          url: 'https://master.ocp44.mg.dog8code.com',
          clusterAuthSecretRef: {
            name: 'ocp311-cslk4',
            namespace: 'openshift-config',
          },
          clusterUrl: '',
          azureResourceGroup: '',
          caBundle: '',
        },
        status: {
          conditions: [],
          observedDigest: '',
        },
        id: '',
      },
    },
  ],
};

const selectedProps: Partial<IResourceSelectFormProps> = {
  values: {
    persistentVolumes: [],
    planName: 'test',
    pvCopyMethodAssignment: {},
    pvStorageClassAssignment: {},
    pvVerifyFlagAssignment: {},
    selectedNamespaces: ['namespace1', 'namespace2'],
    selectedStorage: 'minio2',
    sourceCluster: 'ocp311',
    targetCluster: 'host',
  },
};

describe('<ResourceSelectForm />', () => {
  test('loads resource select form', async () => {
    const { container, getByText, queryByText, rerender } = render(
      <ResourceSelectForm {...defaultProps} {...clusterListProps} />
    );

    fireEvent.click(getByText('Source cluster'));

    const finishLoading = () => waitFor(() => expect(queryByText('Loading')).toBeNull());

    finishLoading();

    rerender(<ResourceSelectForm {...defaultProps} {...clusterListProps} {...selectedProps} />);

    expect(container.firstChild).toHaveTextContent(/2 selected/);
  });
});
