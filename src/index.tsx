import '@patternfly/react-core/dist/styles/base.css';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { history } from './helpers';
import AppComponent from './app/AppComponent';
import { ConnectedRouter } from 'connected-react-router';
import { PersistGate } from 'redux-persist/es/integration/react';
import configureStore from './configureStore';
const { persistor, store } = configureStore();
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';

import './global.scss';

render(
  <Provider store={store}>
    <PersistGate loading={<Spinner size="xl" />} persistor={persistor}>
      <ConnectedRouter history={history}>
        <AppComponent />
      </ConnectedRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);
