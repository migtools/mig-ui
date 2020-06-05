import { render, fireEvent, screen } from '@testing-library/react';
import ResourceSelectForm, { IResourceSelectFormProps } from '../ResourceSelectForm';
import React, { useEffect } from 'react';
import '@testing-library/jest-dom/extend-expect';

import { planValue } from './planHelper';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function renderResourceSelectForm(props: Partial<IResourceSelectFormProps> = {}) {
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
    clusterList: [
      {
        ClusterStatus: {
          hasCriticalCondition: false,
          hasReadyCondition: true,
        },
        MigCluster: {
          apiVersion: 'migration.openshift.io/v1alpha1',
          kind: 'MigCluster',
          metadata: {
            name: 'ocp311',
            namespace: 'openshift-migration',
          },
          spec: {
            insecure: true,
            isHostCluster: false,
            serviceAccountSecretRef: {
              name: 'ocp311-cslk4',
              namespace: 'openshift-config',
            },
            storageClasses: [],
            url: 'https://master.ocp311.mg.dog8code.com',
          },
        },
      },
      {
        ClusterStatus: {
          hasCriticalCondition: false,
          hasReadyCondition: true,
        },
        MigCluster: {
          apiVersion: 'migration.openshift.io/v1alpha1',
          kind: 'MigCluster',
          metadata: {
            name: 'host',
            namespace: 'openshift-migration',
          },
          spec: {
            isHostCluster: true,
            storageClasses: [{ name: 'gp2', provisioner: 'kubernetes.io/aws-ebs' }],
          },
        },
      },
    ],
    errors: '',
    isEdit: true,
    isFetchingNamespaceList: true,
    sourceClusterNamespaces: [],
    storageList: [],
    values: planValue,
  };

  return render(<ResourceSelectForm {...defaultProps} {...props} />);
}

describe('<ResourceSelectForm />', () => {
  test('loads resource select form', async () => {
    renderResourceSelectForm();

    fireEvent.click(screen.getByText('Source cluster'));
    // Wait for page to update with query text
    const Loader = await screen.findByText(/Loading/);
    expect(Loader).toHaveTextContent('Loading');

    fireEvent.change(screen.getByTestId('source-cluster-select'), {
      target: { value: 'ocp311' },
    });

    // mockedAxios.get.mockResolvedValueOnce({
    //   data: { greeting: 'hello there' },
    // });
  });
});
