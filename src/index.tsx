import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { ConnectedRouter } from "connected-react-router";
import { history } from "./app/common/duck/utils";
import logger from "redux-logger";
import thunk from "redux-thunk";
import { createStore, applyMiddleware } from "redux";
import rootReducer from "./reducers";
import AppComponent from "./app/AppComponent";
import "@patternfly/react-core/dist/styles/base.css";

const middleware = applyMiddleware(thunk, logger);
const store = createStore(rootReducer, middleware);

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <AppComponent />
    </ConnectedRouter>
  </Provider>,
  document.getElementById("root")
);
