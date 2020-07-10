import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from '../../../../../../../reducers';

import NamespacesForm from '../NamespacesForm';

const store = createStore(rootReducer, {});

describe('<NamespacesForm />', () => {
  const initProps = {
    isFetchingNamespaceList: true,
    setFieldValue: () => {
      return;
    },
    sourceClusterNamespaces: [],
    values: {
      persistentVolumes: [],
      planName: '',
      pvCopyMethodAssignment: {},
      pvStorageClassAssignment: {},
      pvVerifyFlagAssignment: {},
      sourceTokenRef: {
        name: '',
        namespace: '',
      },
      targetTokenRef: {
        name: '',
        namespace: '',
      },
      selectedNamespaces: [],
      selectedStorage: '',
      sourceCluster: '',
      targetCluster: '',
    },
  };

  it('has loading status in header', () => {
    const props = {
      fetchNamespacesRequest: jest.fn(),
      isFetchingNamespaceList: true,
    };

    render(
      <Provider store={store}>
        <NamespacesForm {...initProps} {...props} />
      </Provider>
    );

    expect(screen.getByRole('heading')).toHaveTextContent('Loading...');
    expect(props.fetchNamespacesRequest).toHaveBeenCalledTimes(1);
    expect(props.fetchNamespacesRequest).toHaveBeenCalledWith(initProps.values.sourceCluster);
  });

  it('has no result found heading', () => {
    const props = {
      fetchNamespacesRequest: jest.fn(),
      isFetchingNamespaceList: false,
    };

    const { rerender, container } = render(
      <Provider store={store}>
        <NamespacesForm {...initProps} {...props} />
      </Provider>
    );

    expect(screen.getByRole('heading')).toHaveTextContent('No results found');
    expect(props.fetchNamespacesRequest).toHaveBeenCalledTimes(1);
    expect(props.fetchNamespacesRequest).toHaveBeenCalledWith(initProps.values.sourceCluster);
  });

  it('displays namespaces', () => {
    const props = {
      fetchNamespacesRequest: jest.fn(),
      isFetchingNamespaceList: false,
      sourceClusterNamespaces: [
        {
          name: 'namespace1',
          podCount: 1,
          pvcCount: 1,
          serviceCount: 1,
        },
        {
          name: 'namespace2',
          podCount: 2,
          pvcCount: 1,
          serviceCount: 1,
        },
      ],
    };

    render(
      <Provider store={store}>
        <NamespacesForm {...initProps} {...props} />
      </Provider>
    );
    expect(screen.getByRole('cell', { name: 'namespace1' })).toHaveTextContent('namespace1');
    expect(screen.getByRole('cell', { name: 'namespace2' })).toHaveTextContent('namespace2');
    expect(props.fetchNamespacesRequest).toHaveBeenCalledTimes(1);
  });
});
