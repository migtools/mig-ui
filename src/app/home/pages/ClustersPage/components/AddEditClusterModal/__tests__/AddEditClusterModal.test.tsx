import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import AddEditClusterModal from '../index';
import { debug } from 'console';

const mockStore = configureStore([]);

describe('<AddEditClusterModal />', () => {
  it('loads form with existing values and allows changes', () => {
    const store = mockStore({
      cluster: {
        addEditStatus: {
          message: 'The cluster is ready.',
          mode: 'edit',
          reason: '',
          state: 'ready',
        },
        clusterList: [
          {
            MigCluster: {
              apiVersion: 'migration.openshift.io/v1alpha1',
              kind: 'MigCluster',
              metadata: {
                annotations: {
                  'openshift.io/touch': '0166e8fd-cc1f-11ea-b68f-0a580a810233',
                },
                creationTimestamp: '2020-06-24T07:43:26Z',
                generation: 12,
                name: 'gildub3ocp311',
                namespace: 'openshift-migration',
                resourceVersion: '15497761',
                selfLink:
                  '/apis/migration.openshift.io/v1alpha1/namespaces/openshift-migration/migclusters/gildub3ocp311',
                uid: '73eea1b4-0ca0-4286-a2fd-9b7d35a464a1',
              },
              spec: {
                insecure: true,
                isHostCluster: false,
                serviceAccountSecretRef: {
                  name: 'gildub3ocp311-95xqg',
                  namespace: 'openshift-config',
                },
                url: 'https://master.gildub3ocp311.mg.dog8code.com',
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
                observedDigest: '1dd49e3d562cc6121f4b23d0317e794d07fa8ebd8996580a321c30bc197f77fb',
              },
            },
            Secret: {
              kind: 'Secret',
              apiVersion: 'v1',
              metadata: {
                name: 'gildub3ocp311-95xqg',
                generateName: 'gildub3ocp311-',
                namespace: 'openshift-config',
                selfLink: '/api/v1/namespaces/openshift-config/secrets/gildub3ocp311-95xqg',
                uid: 'fa27cf3d-a24c-4c16-b654-6057b7414cf8',
                resourceVersion: '3219997',
                creationTimestamp: '2020-06-24T07:43:26Z',
                labels: {
                  createdForResource: 'gildub3ocp311',
                  createdForResourceType: 'migclusters',
                },
              },
              data: {
                saToken:
                  'ZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNklpSjkuZXlKcGMzTWlPaUpyZFdKbGNtNWxkR1Z6TDNObGNuWnBZMlZoWTJOdmRXNTBJaXdpYTNWaVpYSnVaWFJsY3k1cGJ5OXpaWEoyYVdObFlXTmpiM1Z1ZEM5dVlXMWxjM0JoWTJVaU9pSnZjR1Z1YzJocFpuUXRiV2xuY21GMGFXOXVJaXdpYTNWaVpYSnVaWFJsY3k1cGJ5OXpaWEoyYVdObFlXTmpiM1Z1ZEM5elpXTnlaWFF1Ym1GdFpTSTZJbTFwWjNKaGRHbHZiaTFqYjI1MGNtOXNiR1Z5TFhSdmEyVnVMV2R4YTJoaUlpd2lhM1ZpWlhKdVpYUmxjeTVwYnk5elpYSjJhV05sWVdOamIzVnVkQzl6WlhKMmFXTmxMV0ZqWTI5MWJuUXVibUZ0WlNJNkltMXBaM0poZEdsdmJpMWpiMjUwY205c2JHVnlJaXdpYTNWaVpYSnVaWFJsY3k1cGJ5OXpaWEoyYVdObFlXTmpiM1Z1ZEM5elpYSjJhV05sTFdGalkyOTFiblF1ZFdsa0lqb2lOemhrTnpjNFlURXRZalUxWWkweE1XVmhMVGhrWkdFdE1EWmpOekJoTkRNNE56VXdJaXdpYzNWaUlqb2ljM2x6ZEdWdE9uTmxjblpwWTJWaFkyTnZkVzUwT205d1pXNXphR2xtZEMxdGFXZHlZWFJwYjI0NmJXbG5jbUYwYVc5dUxXTnZiblJ5YjJ4c1pYSWlmUS5ESkZlR056Q09VR0dHS1pkWVFEUFlDcFRSVzRwVDNuaUZJYll6TmNkVXNmbXBoaHhmS0tZOTM5cWpIQXFscnpaa0Jra1NrWWZNbnZ3QkNaelVnTHA1dmxfd3V1ZWpwSWJ3Q25rTkZoRXpsNlpLZlQ3eGhTandEWTY3S0FqNUkxcElXU3p2cXUxMnl2R3R2UkNENnpZWXhVcFFGYW1pMWhGelRHQ0V1Nk1HbnlEOHE2SXJDX1RLd2l4SFhkUnNnY3dJVnE4NUd3cHBfQjlFVzZDaFFuNGZZQ3Y1M3FvU1kxa3hRYW5ZTld4bGFOT0hnU1JoQk53TW9IaWFfUF8yR18wU0ZHeXBBTUJUTDRQNjlZblNWT2FSdDFITndxeXlPVzQ3WHVsR1VBRlJnNWRzbkpfQm53cUxVWWQ4VkdmeklhZmlnUmZCeTlScVZSS214VVVFd1hCeHc=',
              },
              type: 'Opaque',
            },
          },
          {
            MigCluster: {
              apiVersion: 'migration.openshift.io/v1alpha1',
              kind: 'MigCluster',
              metadata: {
                annotations: {
                  'openshift.io/touch': 'ba248ac5-cc06-11ea-b68f-0a580a810233',
                },
                creationTimestamp: '2020-06-23T13:45:05Z',
                generation: 2,
                name: 'host',
                namespace: 'openshift-migration',
                ownerReferences: [
                  {
                    apiVersion: 'migration.openshift.io/v1alpha1',
                    kind: 'MigrationController',
                    name: 'migration-controller',
                    uid: 'fe813e9c-62fa-4de4-9afa-137fedcc83b8',
                  },
                ],
                resourceVersion: '15445020',
                selfLink:
                  '/apis/migration.openshift.io/v1alpha1/namespaces/openshift-migration/migclusters/host',
                uid: '5a326e14-4222-4d73-b5ff-a97a7da209a1',
              },
              spec: {
                isHostCluster: true,
                storageClasses: [
                  {
                    accessModes: ['ReadWriteOnce'],
                    default: true,
                    name: 'gp2',
                    provisioner: 'kubernetes.io/aws-ebs',
                  },
                ],
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
                observedDigest: 'ae3b8d7250b116f72586b57fec0194182d57bbc21f26bbc83a5527299223fcd7',
              },
            },
          },
        ],
        isErrorfalse: false,
        isFetchingfalse: false,
        isFetchingInitialClustersfalse: false,
        isPollingfalse: false,
        searchTerm: '',
      },
      auth: {
        isAdmin: true,
      },
    });

    store.dispatch = jest.fn();

    const initialProps = {
      isOpen: true,
      onHandleClose: jest.fn(),
      initialClusterValues: {
        clusterName: 'existing-clustername',
        clusterUrl: 'http://existing.example.com',
        clusterSvcToken: 'existing-secret',
        clusterIsAzure: true,
        clusterAzureResourceGroup: 'Azure-resource-group',
        clusterRequireSSL: true,
        clusterCABundle: 'V2tWRk9WQlhWVDF6dA==',
      },
    };

    render(
      <Provider store={store}>
        <AddEditClusterModal {...initialProps} />
      </Provider>
    );

    const name = screen.getByLabelText(/Cluster name/);
    const url = screen.getByLabelText(/URL/);
    const passwd = screen.getByLabelText(/Service account token/);
    const azure = screen.getByLabelText(/Azure cluster/);
    const azureGroup = screen.getByLabelText(/Azure resource group/);
    const ssl = screen.getByLabelText(/Require SSL verification/);
    const ca = screen.getByLabelText(/Upload CA bundle/);
    const updateButton = screen.getByRole('button', { name: /Update cluster/ });

    expect(updateButton).toHaveAttribute('disabled');

    expect(name).toHaveValue('existing-clustername');
    expect(url).toHaveValue('http://existing.example.com');
    expect(passwd).toHaveValue('existing-secret');
    expect(azure).toBeChecked();
    expect(azureGroup).toHaveValue('Azure-resource-group');
    expect(ssl).toBeChecked();
    expect(ca).toHaveValue('V2tWRk9WQlhWVDF6dA==');

    userEvent.type(url, ':443');
    expect(url).toHaveValue('http://existing.example.com:443');
    expect(updateButton).not.toHaveAttribute('disabled');
  });
});
