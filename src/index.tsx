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

const middleware = applyMiddleware(thunk, logger, routerMiddleware(history));
const store = createStore(rootReducer, middleware);

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
       <AppComponent />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);
