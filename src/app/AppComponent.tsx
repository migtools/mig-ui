import React from 'react';
import HomeComponent from './home/HomeComponent';
import LoginComponent from './auth/LoginComponent';
import { Route, Switch, Redirect, Router } from 'react-router-dom';
import PrivateRoute from './auth/PrivateRoute';
import { connect } from 'react-redux';
import { history } from '../helpers';
import { commonOperations } from './common/duck';

interface IProps {
  loggedIn?: boolean;
  alertMessage: string;
  alertType: string;
  onRedirect: () => void;
}

const AppComponent: React.SFC<IProps> = ({ alertMessage, alertType, loggedIn }) => (
  <div className="app-container-wrapper">
    {alertMessage && (
      <div className={`alert ${alertType}`}>{alertMessage}</div>
    )}
    <Switch>
      <PrivateRoute exact path="/" component={HomeComponent} />
      <Route path="/login" component={LoginComponent} />
    </Switch>
  </div>
);

export default connect(
  state => ({
    loggedIn: state.auth.loggedIn,
    alertMessage: state.common.alertMessage,
    alertType: state.common.alertType,
  }),
  dispatch => ({
    clearAlerts: () => dispatch(commonOperations.alertClear()),
  }),
)(AppComponent);
