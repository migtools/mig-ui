import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

import { history } from '../helpers';
import { alertActions } from '../actions';
import PrivateRoute from '../components/PrivateRoute';
import { HomePage, LoginPage } from '../components/pages';
import CSSModules from 'react-css-modules';
import { Alert, AlertActionCloseButton } from '@patternfly/react-core';
import '../index-nomodules.css';

class App extends React.Component<any, any> {

  logout = e => {
    e.preventDefault();
    this.props.onRedirect("/login");
  };
  navHome = () => {
    this.props.onRedirect("/");
  };

  render() {
    const { alert, authentication } = this.props;
    return (
      <div className="app-container-wrapper">
          <div className="menu-wrapper">
            <div className="center-content-container">
              {alert.message && !authentication.loggedIn && (
                <div className={`alert ${alert.type}`}>
                  {alert.message.message}
                </div>
              )}
              <Switch>
                <Route exact path="/login" component={LoginPage} />
                <PrivateRoute exact path="/" component={HomePage} isLoggedIn={authentication.loggedIn} />
                {
                  authentication.loggedIn
                    ? <Redirect from="*" to="/" />
                    : <Redirect from="*" to="/login" />
                }
              </Switch>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  (state) => ({
    alert: state.alert,
    authentication: state.authentication
  }),
  (dispatch) => ({
    onRedirect: (path) => dispatch(push(path))
  })
)(App);
