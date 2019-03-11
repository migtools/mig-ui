import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { store, history } from "./helpers";
import App from "./App";
import { Router } from "react-router-dom";
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';

import "@patternfly/react-core/dist/styles/base.css";
// import App from "./App";
// setup fake backend
// import { configureFakeBackend } from './_helpers';
// configureFakeBackend();

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById("root")
);
