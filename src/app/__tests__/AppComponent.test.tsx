import '@patternfly/react-core/dist/styles/base.css';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { history } from '../../helpers';
import AppComponent from '../AppComponent';
import { ConnectedRouter } from 'connected-react-router';
import configureStore from 'redux-mock-store';
import { initialStore } from '../../__mocks__/store';

jest.mock('../common/components/CAM_LOGO.svg', () => {
  return '';
});

jest.mock('../common/components/logoMA.svg', () => {
  return '';
});

jest.mock('../common/components/logoCrane.svg', () => {
  return '';
});

jest.mock('../common/components/namespaces_icon.svg', () => {
  return '';
});

jest.mock('../common/components/logoRedHat.svg', () => {
  return '';
});

describe('<AppComponent />', () => {
  it('loads home page and provide a working main menu', () => {
    const mockStore = configureStore([]);
    const store = mockStore(initialStore);
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <AppComponent />
        </ConnectedRouter>
      </Provider>
    );

    expect(screen.getByRole('link', { name: 'Clusters' })).toBeInTheDocument;
    expect(screen.getByRole('link', { name: 'Replication repositories' })).toBeInTheDocument;
    expect(screen.getByRole('link', { name: 'Migration plans' })).toBeInTheDocument;

    userEvent.click(screen.getByRole('link', { name: 'Clusters' }));
    expect(screen.getByRole('button', { name: 'Add cluster' })).toBeInTheDocument;

    userEvent.click(screen.getByRole('link', { name: 'Replication repositories' }));
    expect(screen.getByRole('button', { name: 'Add replication repository' })).toBeInTheDocument;

    userEvent.click(screen.getByRole('link', { name: 'Migration plans' }));
    expect(screen.getByRole('button', { name: 'Add migration plan' })).toBeInTheDocument;
  });
});
