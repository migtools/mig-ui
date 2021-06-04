import React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { history } from './helpers';
import AppRoutes from './routes';
import { ConnectedRouter } from 'connected-react-router';
import { PersistGate } from 'redux-persist/es/integration/react';

import { Spinner } from '@patternfly/react-core';
import { AppLayout } from './layout/AppLayout';
import configureStore from './configureStore';
const { persistor, store } = configureStore();

import ReactDOM from 'react-dom';

if (process.env.NODE_ENV !== 'production') {
  const config = {
    rules: [
      {
        id: 'color-contrast',
        enabled: false,
      },
    ],
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
  // const axe = require('react-axe');
  // axe(React, ReactDOM, 1000, config);
}
ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={<Spinner size="xl" />} persistor={persistor}>
      <ConnectedRouter history={history}>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </ConnectedRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
