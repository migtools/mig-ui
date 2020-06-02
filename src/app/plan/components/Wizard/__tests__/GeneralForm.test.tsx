import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import GeneralForm, { IGeneralFormProps } from '../GeneralForm';
import '@testing-library/jest-dom';

import { planValue } from './planHelper';

function renderGeneralForm(props: Partial<IGeneralFormProps> = {}) {
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
    values: planValue,
  };

  return render(<GeneralForm {...defaultProps} {...props} />);
}

describe('<GeneralForm />', () => {
  test('has a plan name', async () => {
    const { findByTestId } = renderGeneralForm();
    const planForm = await findByTestId('plan-form');

    expect(planForm).toHaveFormValues({
      planName: 'plan-name-test',
    });
  });
});
