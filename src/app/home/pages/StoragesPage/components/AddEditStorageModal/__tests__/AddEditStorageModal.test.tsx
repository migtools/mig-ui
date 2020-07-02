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
  it('allows filling a S3 form with valid values', () => {
    render(
      <Provider store={store}>
        <AddEditStorageModal isOpen={true} />
      </Provider>
    );

    userEvent.click(screen.getByText('Select a type...'));
    userEvent.click(screen.getByText('S3'));
    userEvent.type(screen.getByLabelText('Replication repository name'), 'storage-s3-name');
    userEvent.type(screen.getByLabelText('S3 bucket name'), 'storage-s3-bucket-name');
    userEvent.type(screen.getByLabelText('S3 bucket region'), 'storage-s3-bucket-region');
    userEvent.type(screen.getByLabelText('S3 endpoint'), 'storage-s3-url');
    userEvent.type(screen.getByLabelText('S3 provider access key'), 'storage-s3-user');
    userEvent.type(screen.getByLabelText('S3 provider secret access key'), 'storage-s3-password');

    expect(screen.getByDisplayValue('storage-s3-name')).toBeInTheDocument;
    expect(screen.getByDisplayValue('storage-s3-bucket-name')).toBeInTheDocument;
    expect(screen.getByDisplayValue('storage-s3-bucket-region')).toBeInTheDocument;
    expect(screen.getByDisplayValue('storage-s3-url')).toBeInTheDocument;
    expect(screen.getByDisplayValue('storage-s3-user')).toBeInTheDocument;
    expect(screen.getByDisplayValue('storage-s3-password')).toBeInTheDocument;
    expect(screen.getByRole('button', { name: 'Add Repository' })).toBeEnabled;
  });
});
