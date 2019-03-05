import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { store } from "./helpers";
import App from "./App";
import { Router } from "react-router-dom";
import { history } from "./helpers";
import "@patternfly/react-core/dist/styles/base.css";
// import App from "./App";
// setup fake backend
// import { configureFakeBackend } from './_helpers';
// configureFakeBackend();

render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById("root")
);
