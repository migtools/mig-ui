import React, { Children } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import WizardFormik, { IWizardFormikProps } from '../WizardFormik';
import { defaultInitialValues } from '../WizardContainer';

import GeneralForm, { IGeneralFormProps } from '../GeneralForm';

const initialGeneralFormProps: IGeneralFormProps = {
  clusterList: [],
  storageList: [],
  isEdit: false,
};

const initialFormikProps: IWizardFormikProps = {
  initialValues: defaultInitialValues,
  isEdit: false,
  planList: [],
  children: Children,
};

describe('<GeneralForm />', () => {
  it('allows filling new form with valid values', () => {
    const clusterListProps: Partial<IGeneralFormProps> = {
      clusterList: [
        {
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
              clusterAuthSecretRef: {
                name: '',
                namespace: '',
              },
              clusterUrl: '',
              azureResourceGroup: '',
              caBundle: '',
              insecure: true,
              isHostCluster: false,
              storageClasses: [],
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
        },
        {
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
              clusterAuthSecretRef: {
                name: '',
                namespace: '',
              },
              clusterUrl: '',
              azureResourceGroup: '',
              caBundle: '',
              insecure: true,
              isHostCluster: true,
              storageClasses: [
                {
                  name: 'gp2',
                  provisioner: 'kubernetes.io/aws-ebs',
                },
              ],
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
        },
      ],
    };

    const storageListProps: Partial<IGeneralFormProps> = {
      storageList: [
        {
          MigStorage: {
            apiVersion: 'migration.openshift.io/v1alpha1',
            kind: 'MigStorage',
            metadata: {
              annotations: {
                'migration.openshift.io/mig-ui.aws-s3': 'false',
              },
              creationTimestamp: '2020-06-24T07:39:14Z',
              generation: 2,
              labels: {
                'controller-ToolsIcon.k8s.io': 1,
                'migrations.openshift.io/migration-group': '',
              },
              name: 'minio',
              namespace: 'openshift-migration',
              resourceVersion: '6151659',
              selfLink: '',
              uid: '886a5f3e-511d-4703-8460-fc4410e1fa1b',
            },
            spec: {
              bucketUrl: '',
              backupStorageConfig: {
                awsBucketName: 'bucket-name',
                awsRegion: 'eu-central-1',
                awsS3Url: 'http://minio-gpte-minio.apps.cluster.example.com',
                gcpBucket: 'string',
                azureResourceGroup: 'string',
                azureStorageAccount: 'string',
                insecure: true,
                s3CustomCABundle: 'string',
              },
              backupStorageProvider: 'aws',
              backupStorageLocationRef: { name: '' },
              migrationStorageSecretRef: {
                name: '',
                namespace: '',
              },
            },
            status: {
              conditions: [
                {
                  category: 'Required',
                  lastTransitionTime: '2020-06-24T07:39:14Z',
                  message: 'The storage is ready.',
                  status: '',
                  type: '',
                },
              ],
            },
            id: '',
          },
          Secret: {
            data: {
              'aws-access-key-id': 'bWluaW8=',
              'aws-secret-access-key': 'bWluaW8xMjM=',
              'gcp-credentials': '',
              'azure-credentials': '',
            },
          },
          StorageStatus: {
            hasReadyCondition: true,
          },
        },
      ],
    };

    const initialFormikProps: IWizardFormikProps = {
      initialValues: { ...defaultInitialValues },
      isEdit: false,
      planList: [],
      children: Children,
    };

    render(
      <WizardFormik {...initialFormikProps}>
        <GeneralForm {...initialGeneralFormProps} {...clusterListProps} {...storageListProps} />
      </WizardFormik>
    );

    const planName = screen.getByRole('textbox', { name: /Plan name/ });
    userEvent.type(planName, 'planname');

    const srcCluster = screen.getByRole('button', { name: /Select source.../ });
    userEvent.click(srcCluster);
    userEvent.click(screen.getByText('ocp311'));
    const dstCluster = screen.getByRole('button', { name: /Select target.../ });
    userEvent.click(dstCluster);
    userEvent.click(screen.getByText('host'));
    const storage = screen.getByRole('button', { name: /Select repository.../ });
    userEvent.click(storage);
    userEvent.click(screen.getByText('minio'));

    expect(planName).toHaveValue('planname');
    expect(screen.getByText('ocp311')).toBeInTheDocument;
    expect(screen.getByText('host')).toBeInTheDocument;
    expect(screen.getByText('minio')).toBeInTheDocument;
  });

  it('allows editing form with valid values', () => {
    const editValues = {
      planName: 'plan-name-test',
      sourceCluster: 'src-cluster-test',
      sourceTokenRef: {
        name: 'token1',
        namespace: 'openshift-migration',
      },
      targetCluster: 'dst-cluster-test',
      targetTokenRef: {
        name: 'token2',
        namespace: 'openshift-migration',
      },
      selectedStorage: 'storage-test',
    };

    const initialFormikProps: IWizardFormikProps = {
      initialValues: { ...defaultInitialValues, ...editValues },
      isEdit: true,
      planList: [],
      children: Children,
    };

    render(
      <WizardFormik {...initialFormikProps}>
        <GeneralForm {...initialGeneralFormProps} />
      </WizardFormik>
    );

    expect(screen.getByRole('textbox', { name: /Plan name/ })).toHaveValue('plan-name-test');
    expect(screen.getByText('src-cluster-test')).toBeInTheDocument;
    expect(screen.getByText('dst-cluster-test')).toBeInTheDocument;
    expect(screen.getByText('storage-test')).toBeInTheDocument;
  });
});
