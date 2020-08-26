import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import AddEditClusterForm from '../AddEditClusterForm';

describe('<AddEditClusterModal />', () => {
  it('allows filling form with valid values', () => {
    const props = {
      isOpen: true,
      addEditStatus: {
        state: 'pending',
        mode: 'add',
      },
    };

    render(<AddEditClusterForm {...props} />);

    const name = screen.getByLabelText(/Cluster name/);
    const url = screen.getByLabelText(/URL/);
    const passwd = screen.getByLabelText(/Service account token/);
    const addButton = screen.getByRole('button', { name: /Add cluster/ });

    expect(addButton).toHaveAttribute('disabled');

    userEvent.type(name, 'clustername');
    userEvent.type(url, 'http://example.com');
    userEvent.type(passwd, 'secret-test');

    expect(name).toHaveValue('clustername');
    expect(url).toHaveValue('http://example.com');
    expect(passwd).toHaveValue('secret-test');
    expect(addButton).not.toHaveAttribute('disabled');
  });

  it('triggers validation messages when using wrong values', async () => {
    const props = {
      isOpen: true,
      addEditStatus: {
        state: 'pending',
        mode: 'add',
      },
    };

    render(<AddEditClusterForm {...props} />);

    const name = screen.getByLabelText(/Cluster name/);
    const url = screen.getByLabelText(/URL/);

    userEvent.type(name, 'BAD-NAME');
    fireEvent.blur(name);

    userEvent.type(url, 'example.com');
    fireEvent.blur(url);

    await waitFor(() => {
      expect(screen.getByText(/Invalid character: "BAD-NAME"/)).not.toBeNull();
      expect(screen.getByText(/Not a valid URL/)).not.toBeNull();
      expect(screen.getByRole('button', { name: /Add cluster/ })).toHaveAttribute('disabled');
    });
  });

  it('loads form with existing values and allows changes', () => {
    const props = {
      isOpen: false,
      isPolling: false,
      initialClusterValues: {
        clusterName: 'existing-clustername',
        clusterUrl: 'http://existing.example.com',
        clusterSvcToken: 'existing-secret',
        clusterIsAzure: true,
        clusterAzureResourceGroup: 'Azure-resource-group',
        clusterRequireSSL: true,
        clusterCABundle: 'V2tWRk9WQlhWVDF6dA==',
      },
      addEditStatus: {
        state: 'ready',
        mode: 'edit',
        message: 'The cluster is ready.',
        reason: '',
      },
    };

    render(<AddEditClusterForm {...props} />);

    const name = screen.getByLabelText(/Cluster name/);
    const url = screen.getByLabelText(/URL/);
    const passwd = screen.getAllByLabelText(/Service account token/)[0];
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
