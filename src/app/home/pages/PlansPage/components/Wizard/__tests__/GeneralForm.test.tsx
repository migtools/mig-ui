import React, { Children } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import WizardFormik, { IWizardFormikProps } from '../WizardFormik';
import { defaultInitialValues } from '../WizardContainer';

import GeneralForm, { IGeneralFormProps } from '../GeneralForm';
import { clusterExample1, clusterExample2 } from '../__mocks__/fixturesCluster';
import { storageExample1 } from '../__mocks__/fixturesStorage';

const initialFormikProps: IWizardFormikProps = {
  initialValues: defaultInitialValues,
  isEdit: false,
  planList: [],
  sourceClusterNamespaces: [],
  children: Children,
};

describe('<GeneralForm />', () => {
  it('allows filling new form with valid values', () => {
    const initialFormikProps: IWizardFormikProps = {
      initialValues: { ...defaultInitialValues },
      isEdit: false,
      planList: [],
      sourceClusterNamespaces: [],
      children: Children,
    };

    const initialGeneralFormProps: IGeneralFormProps = {
      clusterList: [clusterExample1, clusterExample2],
      storageList: [storageExample1],
      isEdit: false,
    };
    render(
      <WizardFormik {...initialFormikProps}>
        <GeneralForm {...initialGeneralFormProps} />
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
      sourceClusterNamespaces: [],
      children: Children,
    };

    const initialGeneralFormProps: IGeneralFormProps = {
      clusterList: [],
      storageList: [],
      isEdit: true,
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
