import React from 'react';
import ReactDOM from 'react-dom';
import { render, cleanup, screen, fireEvent } from '@testing-library/react';
import GeneralForm, { IGeneralFormProps } from '../GeneralForm';
import '@testing-library/jest-dom';

import { planValue } from './planHelper';

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

function renderGeneralForm(props: Partial<IGeneralFormProps> = {}) {
  return render(<GeneralForm {...defaultProps} {...props} />);
}

// afterEach(cleanup);

describe('<GeneralForm />', () => {
  it('renders component', () => {
    const div = document.createElement('div');
    ReactDOM.render(<GeneralForm {...defaultProps}></GeneralForm>, div);
  });

  it('has a plan name', async () => {
    renderGeneralForm();
    const planForm = await screen.findByTestId('plan-form');

    expect(planForm).toHaveFormValues({
      planName: 'plan-name-test',
    });
  });

  it('has a plan name', async () => {
    renderGeneralForm();
    const planForm = await screen.findByTestId('plan-form');

    expect(planForm).toHaveFormValues({
      planName: 'plan-name-test',
    });
  });
});
