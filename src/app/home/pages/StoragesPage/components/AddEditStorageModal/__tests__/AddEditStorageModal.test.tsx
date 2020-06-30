import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from '../../../../../../../reducers';

import AddEditStorageModal from '../index';

const store = createStore(rootReducer, {});

describe('<AddEditStorageModal />', () => {
  it('adds a S3 type storage', () => {
    const initialProps = {
      isOpen: true,
      onHandleClose: jest.fn(),
      cluster: jest.fn(),
    };

    render(
      <Provider store={store}>
        <AddEditStorageModal {...initialProps} />
      </Provider>
    );

    userEvent.click(screen.getByText('Select a type...'));
    userEvent.click(screen.getByText('S3'));
    userEvent.type(screen.getByTestId('storage-name-input'), 'storage-name');
    userEvent.type(screen.getByTestId('storage-bucket-name-input'), 'storage-bucket-name');
    userEvent.type(screen.getByTestId('storage-bucket-region-input'), 'storage-bucket-region');
    userEvent.type(screen.getByTestId('storage-s3-url-input'), 'storage-s3-url');
    userEvent.type(screen.getByTestId('storage-access-key-input'), 'storage-s3-user');
    userEvent.type(screen.getByTestId('storage-secret-input'), 'storage-s3-password');

    expect(screen.getByDisplayValue('storage-name')).toBeInTheDocument;
    expect(screen.getByDisplayValue('storage-bucket-name')).toBeInTheDocument;
    expect(screen.getByDisplayValue('storage-bucket-region')).toBeInTheDocument;
    expect(screen.getByDisplayValue('storage-s3-url')).toBeInTheDocument;
    expect(screen.getByDisplayValue('storage-s3-user')).toBeInTheDocument;
    expect(screen.getByDisplayValue('storage-s3-password')).toBeInTheDocument;
    expect(screen.getByRole('button', { name: 'Add Repository' })).toBeEnabled;
  });
});
