import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { history } from './helpers';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import AppComponent from './app/AppComponent';
import '@patternfly/react-core/dist/styles/base.css';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { initMigMeta } from './mig_meta';
import { authOperations } from './app/auth/duck';

const middleware = applyMiddleware(thunk, logger, routerMiddleware(history));
const store = createStore(rootReducer, middleware);

// Some amount of meta data is delievered to the app by the server
/* tslint:disable:no-string-literal */
const migMeta = window['_mig_meta'];
/* tslint:enable:no-string-literal */

// Load the meta into the redux tree if it was found on the window
// Will only be present in remote-dev and production scenarios where
// oauth meta must be loaded
if (!!migMeta) {
  store.dispatch(initMigMeta(migMeta));
  // TODO: Apparently store.dispatch has some known issues with the compiler
  // when passing it thunks. Need to come back around to this in the future.
  // @ts-ignore
  store.dispatch(authOperations.initFromStorage());
}

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
       <AppComponent />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);
