import React, { Component } from "react";
import HomeContainer from "./home/HomeContainer";
import LoginContainer from "./auth/LoginContainer";
import { Route, Switch, Redirect } from "react-router-dom";
import PrivateRoute from "./auth/PrivateRoute";
import { connect } from "react-redux";
import { push } from "connected-react-router";

const AppComponent = ({ alertMessage, alertType, loggedIn, ...props }) => (
  <div className="app-container-wrapper">
    {alertMessage && !loggedIn && (
      <div className={`alert ${alertType}`}>{alertMessage}</div>
    )}
    <Switch>
      <Route exact path="/login" component={LoginContainer} />
      <PrivateRoute exact path="/" component={HomeContainer} />
      {localStorage.getItem("currentUser") ? (
        <Redirect from="*" to="/" />
      ) : (
        <Redirect from="*" to="/login" />
      )}
    </Switch>
  </div>
);

export default connect(
  state => ({
    loggedIn: state.auth.loggedIn,
    alertMessage: state.common.alertMessage,
    alertType: state.common.alertType
  }),
  dispatch => ({
    onRedirect: path => dispatch(push(path))
  })
)(AppComponent);
