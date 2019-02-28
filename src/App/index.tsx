import React from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import { history } from "../_helpers";
import { alertActions } from "../_actions";
import { PrivateRoute } from "../_components/PrivateRoute";
import HomePage from "../HomePage";
import { LoginPage } from "../LoginPage";
import CSSModules from "react-css-modules";
import { Alert, AlertActionCloseButton } from "@patternfly/react-core";
import "./app.css";

class App extends React.Component<any, any> {
  constructor(props) {
    super(props);

    const { dispatch } = this.props;
    history.listen((location, action) => {
      // clear alert on location change
      dispatch(alertActions.clear());
    });
  }

  logout = e => {
    e.preventDefault();
    localStorage.removeItem("currentUser");
    history.push("/");
  };
  navHome = () => {
    history.push("/");
  };
  render() {
    const { alert } = this.props;
    return (
      <div styleName="app-container-wrapper">
        {localStorage.getItem("currentUser") ? (
          <div styleName="menu-wrapper">
            <div styleName="center-content-container">
              <Switch>
                <Route exact path="/login" component={LoginPage} />
                <PrivateRoute exact path="/" component={HomePage} />
                <Redirect from="*" to="/" />
              </Switch>
            </div>
          </div>
        ) : (
          <div>
            {alert.message && (
              <div styleName={`alert ${alert.type}`}>
                {alert.message.message}
              </div>
            )}
            <Switch>
              <Route exact path="/login" component={LoginPage} />
              <Redirect from="*" to="/login" />
            </Switch>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { alert } = state;
  return {
    alert
  };
}

const connectedApp = connect(mapStateToProps)(App);
export { connectedApp as App };
