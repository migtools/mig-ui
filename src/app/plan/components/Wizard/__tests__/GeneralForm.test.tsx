import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import GeneralForm, { IGeneralFormProps } from '../GeneralForm';
import '@testing-library/jest-dom';

import { PvCopyMethod } from '../types';

function renderGeneralForm(props: Partial<IGeneralFormProps> = {}) {
  const pvCopyMethod: PvCopyMethod = 'filesystem';

  const values = {
    planName: 'test',
    sourceCluster: 'test',
    targetCluster: 'test',
    selectedStorage: 'test',
    selectedNamespaces: [],
    persistentVolumes: [],
    pvStorageClassAssignment: {
      ['pvNameTest']: {
        name: 'test',
        provisioner: 'test',
      },
    },
    pvVerifyFlagAssignment: {
      ['pvNameTest']: false,
    },
    pvCopyMethodAssignment: {
      ['pvNameTest']: pvCopyMethod,
    },
  };

  const defaultProps: IGeneralFormProps = {
    handleBlur() {
      return;
    },
    handleChange() {
      return;
    },
    setFieldTouched() {
      return;
    },
    touched: {
      planName: true,
    },
    errors: '',
    isEdit: true,
    values: values,
  };

  return render(<GeneralForm {...defaultProps} {...props} />);
}

describe('<GeneralForm />', () => {
  test('has a plan name', async () => {
    const { findByTestId } = renderGeneralForm();
    const planForm = await findByTestId('plan-form');

    expect(planForm).toHaveFormValues({
      planName: 'test',
    });
  });
});
