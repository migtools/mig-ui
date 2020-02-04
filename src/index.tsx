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
import { initMigMeta } from './mig_meta';
import { authOperations } from './app/auth/duck';
import { setTokenExpiryHandler } from './client/client_factory';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import './app.scss';

const onBeforeLift = () => {
  // take some action before the gate lifts
};
// Some amount of meta data is delivered to the app by the server
const migMeta = JSON.parse(atob(window['_mig_meta']));

// Load the meta into the redux tree if it was found on the window
// Will only be present in remote-dev and production scenarios where
// oauth meta must be loaded
if (migMeta) {
  store.dispatch(initMigMeta(migMeta));
  // TODO: Apparently store.dispatch has some known issues with the compiler
  // when passing it thunks. Need to come back around to this in the future.
  // @ts-ignore
  store.dispatch(authOperations.initFromStorage());
}

// Configure token expiry behavior
setTokenExpiryHandler(() => {
  // TODO: same thunk issue as above
  // @ts-ignore
  store.dispatch(authOperations.logoutUser());
});

render(
  <Provider store={store}>
    <PersistGate
      loading={<Spinner size="xl" />}
      onBeforeLift={onBeforeLift}
      persistor={persistor}
    >
      <ConnectedRouter history={history}>
        <AppComponent />
      </ConnectedRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);
