import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from '../../../../../../../reducers';

import AddEditStorageModal from '../index';

const store = createStore(rootReducer, {});

describe('<AddEditStorageModal />', () => {
  it('allows filling a S3 form with valid values', () => {
    const props = {
      isOpen: true,
      addEditStatus: {
        state: 'pending',
        mode: 'add',
      },
    };

    render(
      <Provider store={store}>
        <AddEditStorageModal {...props} />
      </Provider>
    );

    userEvent.click(screen.getByText('Select a type...'));
    userEvent.click(screen.getByText('S3'));

    const name = screen.getByLabelText(/Replication repository name/);
    const bucketName = screen.getByLabelText(/S3 bucket name/);
    const bucketRegion = screen.getByLabelText(/S3 bucket region/);
    const url = screen.getByLabelText(/S3 endpoint/);
    const accessKey = screen.getByLabelText(/S3 provider access key/);
    const secretKey = screen.getByLabelText(/S3 provider secret access key/);
    const addButton = screen.getByRole('button', { name: /S3 Storage Submit Form/ });

    expect(screen.getByText(/Add replication repository/)).toBeInTheDocument;
    expect(addButton).toHaveAttribute('disabled');

    userEvent.type(name, 'storage-s3-name');
    userEvent.type(bucketName, 'storage-s3-bucket-name');
    userEvent.type(bucketRegion, 'storage-s3-bucket-region');
    userEvent.type(url, 'storage-s3-url');
    userEvent.type(accessKey, 'storage-s3-user');
    userEvent.type(secretKey, 'storage-s3-password');

    expect(name).toHaveValue('storage-s3-name');
    expect(bucketName).toHaveValue('storage-s3-bucket-name');
    expect(bucketRegion).toHaveValue('storage-s3-bucket-region');
    expect(url).toHaveValue('storage-s3-url');
    expect(accessKey).toHaveValue('storage-s3-user');
    expect(secretKey).toHaveValue('storage-s3-password');
    expect(addButton).not.toHaveAttribute('disabled');
  });

  it('forbids filling a S3 form with unvalid values', async () => {
    render(
      <Provider store={store}>
        <AddEditStorageModal isOpen={true} />
      </Provider>
    );

    userEvent.click(screen.getByText('Select a type...'));
    userEvent.click(screen.getByText('S3'));

    const repoName = screen.getByLabelText(/Replication repository name/);
    userEvent.type(repoName, 'S3-BAD-NAME');
    fireEvent.blur(repoName);

    const bucketName = screen.getByLabelText(/S3 bucket name/);
    userEvent.type(bucketName, 'ab');
    fireEvent.blur(bucketName);

    const endpoint = screen.getByLabelText(/S3 endpoint/);
    userEvent.type(endpoint, 'not-a-url');
    fireEvent.blur(endpoint);

    await waitFor(() => {
      expect(screen.getByText(/Invalid character: "S3-BAD-NAME"/)).not.toBeNull();
      expect(
        screen.getByText('The bucket name can be between 3 and 63 characters long.')
      ).not.toBeNull();
      expect(screen.getByText('S3 Endpoint must be a valid URL.')).not.toBeNull();
      expect(screen.getByRole('button', { name: /S3 Storage Submit Form/ })).toHaveAttribute(
        'disabled'
      );
    });
  });

  it('allows filling an AWS S3 form with valid values', () => {
    const props = {
      isOpen: true,
      addEditStatus: {
        state: 'pending',
        mode: 'add',
      },
    };

    render(
      <Provider store={store}>
        <AddEditStorageModal {...props} />
      </Provider>
    );

    userEvent.click(screen.getByText('Select a type...'));
    userEvent.click(screen.getByText('AWS S3'));

    const name = screen.getByLabelText(/Replication repository name/);
    const bucketName = screen.getByLabelText(/S3 bucket name/);
    const bucketRegion = screen.getByLabelText(/S3 bucket region/);
    const accessKey = screen.getByLabelText(/S3 provider access key/);
    const secretKey = screen.getByLabelText(/S3 provider secret access key/);
    const addButton = screen.getByRole('button', { name: /S3 Storage Submit Form/ });

    expect(screen.getByText(/Add replication repository/)).toBeInTheDocument;
    expect(addButton).toHaveAttribute('disabled');

    userEvent.type(name, 'AWS-S3-name');
    userEvent.type(bucketName, 'AWS-S3-bucket-name');
    userEvent.type(bucketRegion, 'AWS-S3-bucket-region');
    userEvent.type(accessKey, 'AWS-S3-user');
    userEvent.type(secretKey, 'AWS-S3-password');

    expect(name).toHaveValue('AWS-S3-name');
    expect(bucketName).toHaveValue('AWS-S3-bucket-name');
    expect(bucketRegion).toHaveValue('AWS-S3-bucket-region');
    expect(accessKey).toHaveValue('AWS-S3-user');
    expect(secretKey).toHaveValue('AWS-S3-password');
    expect(addButton).not.toHaveAttribute('disabled');
  });

  it('forbids filling an AWS S3 form with unvalid values', async () => {
    render(
      <Provider store={store}>
        <AddEditStorageModal isOpen={true} />
      </Provider>
    );

    userEvent.click(screen.getByText('Select a type...'));
    userEvent.click(screen.getByText('AWS S3'));

    const repoName = screen.getByLabelText(/Replication repository name/);
    userEvent.type(repoName, 'AWS-S3-BAD-NAME');
    fireEvent.blur(repoName);

    const bucketName = screen.getByLabelText(/S3 bucket name/);
    userEvent.type(bucketName, 'ab');
    fireEvent.blur(bucketName);

    await waitFor(() => {
      expect(screen.getByText(/Invalid character: "AWS-S3-BAD-NAME"/)).not.toBeNull();
      expect(
        screen.getByText('The bucket name can be between 3 and 63 characters long.')
      ).not.toBeNull();
      expect(screen.getByRole('button', { name: /S3 Storage Submit Form/ })).toHaveAttribute(
        'disabled'
      );
    });
  });

  it('allows filling a GCP form with valid values', () => {
    const props = {
      isOpen: true,
      addEditStatus: {
        state: 'pending',
        mode: 'add',
      },
    };

    render(
      <Provider store={store}>
        <AddEditStorageModal {...props} />
      </Provider>
    );

    userEvent.click(screen.getByText('Select a type...'));
    userEvent.click(screen.getByText('GCP'));

    const name = screen.getByLabelText(/Repository name/);
    const bucket = screen.getByLabelText(/GCP bucket name/);
    const creds = screen.getByLabelText(/GCP credential JSON blob/);
    const addButton = screen.getByRole('button', { name: /GCP Storage Submit Form/ });

    expect(screen.getByText(/Add replication repository/)).toBeInTheDocument;
    expect(addButton).toHaveAttribute('disabled');

    userEvent.type(name, 'gcp-name');
    userEvent.type(bucket, 'gcp-bucket-name');
    userEvent.type(creds, 'GCP-credentials');

    expect(name).toHaveValue('gcp-name');
    expect(bucket).toHaveValue('gcp-bucket-name');
    expect(creds).toHaveValue('GCP-credentials');
    // TODO: Complete form for submit button to be enabled
    // expect(addButton).not.toHaveAttribute('disabled');
  });

  it('forbids filling a GCP form with unvalid values', async () => {
    render(
      <Provider store={store}>
        <AddEditStorageModal isOpen={true} />
      </Provider>
    );

    userEvent.click(screen.getByText('Select a type...'));
    userEvent.click(screen.getByText('GCP'));

    const repoName = screen.getByLabelText(/Repository name/);
    userEvent.type(repoName, 'GCP-BAD-NAME');
    fireEvent.blur(repoName);

    const bucketName = screen.getByLabelText(/GCP bucket name/);
    userEvent.type(bucketName, 'ab');
    fireEvent.blur(bucketName);

    await waitFor(() => {
      expect(screen.getByText(/Invalid character: "GCP-BAD-NAME"/)).not.toBeNull();
      expect(
        screen.getByText('The bucket name can be between 3 and 63 characters long.')
      ).not.toBeNull();
      expect(screen.getByRole('button', { name: /GCP Storage Submit Form/ })).toHaveAttribute(
        'disabled'
      );
    });
  });

  it('allows filling an Azure form with valid values', () => {
    const props = {
      isOpen: true,
      addEditStatus: {
        state: 'pending',
        mode: 'add',
      },
    };

    render(
      <Provider store={store}>
        <AddEditStorageModal {...props} />
      </Provider>
    );

    userEvent.click(screen.getByText('Select a type...'));
    userEvent.click(screen.getByText('Azure'));
    userEvent.click(screen.getByRole('dialog', { name: /Repository information/ }));

    const name = screen.getByLabelText(/Repository name/);
    const group = screen.getByLabelText(/Azure resource group/);
    const account = screen.getByLabelText(/Azure storage account name/);
    const creds = screen.getByLabelText(/Azure credentials/);
    const addButton = screen.getByLabelText(/Azure Storage Submit Form/);

    expect(screen.getByText(/Add replication repository/)).toBeInTheDocument;
    expect(addButton).toHaveAttribute('disabled');

    userEvent.type(name, 'azure-name');
    userEvent.type(group, 'azure-resource-group');
    userEvent.type(account, 'azure-account-name');
    userEvent.type(creds, 'azure-credentials');

    expect(name).toHaveValue('azure-name');
    expect(group).toHaveValue('azure-resource-group');
    expect(account).toHaveValue('azure-account-name');
    expect(creds).toHaveValue('azure-credentials');
    expect(addButton).not.toHaveAttribute('disabled');
  });

  it('forbids filling an Azure form with unvalid values', async () => {
    render(
      <Provider store={store}>
        <AddEditStorageModal isOpen={true} />
      </Provider>
    );

    userEvent.click(screen.getByText('Select a type...'));
    userEvent.click(screen.getByText('Azure'));
    userEvent.click(screen.getByRole('dialog', { name: /Repository information/ }));

    const repoName = screen.getByLabelText(/Repository name/);
    userEvent.type(repoName, 'AZURE-BAD-NAME');
    fireEvent.blur(repoName);

    await waitFor(() => {
      expect(screen.getByText(/Invalid character: "AZURE-BAD-NAME"/)).not.toBeNull();
      expect(screen.getByLabelText(/Azure Storage Submit Form/)).toHaveAttribute('disabled');
    });
  });
});
