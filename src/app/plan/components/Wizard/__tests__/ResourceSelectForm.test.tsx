import { render, fireEvent, screen } from '@testing-library/react';
import ResourceSelectForm, { IResourceSelectFormProps } from '../ResourceSelectForm';
import React, { useEffect } from 'react';
import '@testing-library/jest-dom/extend-expect';

import { planValue } from './planHelper';

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
    clusterList: [],
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
    const { getByText, findByText } = renderResourceSelectForm();

    // Click button
    fireEvent.click(getByText('Source cluster'));

    // Wait for page to update with query text
    const Loader = await findByText(/Loading/);
    expect(Loader).toHaveTextContent('Loading');
  });
});
