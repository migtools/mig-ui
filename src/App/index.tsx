import React from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import { history } from "../helpers";
import { alertActions } from "../actions";
import { PrivateRoute } from "../components/PrivateRoute";
import { HomePage, LoginPage } from "../components/pages";
import CSSModules from "react-css-modules";
import { Alert, AlertActionCloseButton } from "@patternfly/react-core";
import "../index-nomodules.css";

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
      <div className="app-container-wrapper">
        {localStorage.getItem("currentUser") ? (
          <div className="menu-wrapper">
            <div className="center-content-container">
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
              <div className={`alert ${alert.type}`}>
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

export default connect(
  (state) => ({
    alert: state.alert
  })
)(App);
