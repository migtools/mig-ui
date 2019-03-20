import React, { Component } from 'react';
import HomeContainer from './home/HomeContainer';
import LoginContainer from './auth/LoginContainer';
import { Route, Switch, Redirect, Router } from 'react-router-dom';
import PrivateRoute from './auth/PrivateRoute';
import { connect } from 'react-redux';
import { history } from '../helpers';
import { commonOperations } from './common/duck';
import { ConnectedRouter } from 'connected-react-router';

class AppComponent extends React.Component<any, any> {
  render() {
    const { alertMessage, alertType } = this.props;
    return (
      <div className="app-container-wrapper">
        {alertMessage && (
          <div className={`alert ${alertType}`}>{alertMessage}</div>
        )}
        <ConnectedRouter history={history}>
          <Switch>
            <PrivateRoute exact path="/" component={HomeContainer} />
            <Route path="/login" component={LoginContainer} />
          </Switch>
        </ConnectedRouter>
      </div>
    );
  }
}

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
