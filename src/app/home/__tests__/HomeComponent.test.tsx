import '@patternfly/react-core/dist/styles/base.css';
import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Provider } from 'react-redux';
import { history } from '../../../helpers';
import HomeComponent from '../HomeComponent';
import { ConnectedRouter } from 'connected-react-router';
import { PersistGate } from 'redux-persist/es/integration/react';

import configureStore from 'redux-mock-store';
// const { persistor } = configureStore();
import { initialStore } from '../../../__mocks__/store';

import { Spinner } from '@patternfly/react-core';

import '../global.scss';

describe('<HomeComponent />', () => {
  it('loads home page', () => {
    const mockStore = configureStore([]);
    const store = mockStore(initialStore);

    render(
      <Provider store={store.getState()}>
        {/* <PersistGate loading={<Spinner size="xl" />} persistor={persistor}> */}
        <ConnectedRouter history={history}>
          <HomeComponent />
        </ConnectedRouter>
        {/* </PersistGate> */}
      </Provider>
    );
  });
});
