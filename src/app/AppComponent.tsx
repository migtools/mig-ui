import React, { Component } from 'react';
import HomeContainer from './home/HomeContainer';
import LoginContainer from './auth/LoginContainer';
import { Route, Switch, Redirect, Router } from 'react-router-dom';
import PrivateRoute from './auth/PrivateRoute';
import { connect } from 'react-redux';
import { history } from '../helpers';
import { commonOperations } from './common/duck';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'emotion-theming';
import theme from '../theme';
import { Flex, Box, Card, Image, Heading, Text } from '@rebass/emotion';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/core';
import { AlertCard } from './common/components/AlertCard';

class AppComponent extends React.Component<any, any> {
  render() {
    const { alertMessage, alertType } = this.props;
    return (
      <Flex justifyContent="center" width="100%">
        <Box flex="0 0 60em">
          {alertMessage && (
            <AlertCard color={alertType === 'error' ? 'red' : 'green'}>
              {alertMessage}
            </AlertCard>
          )}
          <ThemeProvider theme={theme}>
            <ConnectedRouter history={history}>
              <Switch>
                <PrivateRoute exact path="/" component={HomeContainer} />
                <Route path="/login" component={LoginContainer} />
              </Switch>
            </ConnectedRouter>
          </ThemeProvider>
        </Box>
        <Global
          styles={css`
            body html,
            body,
            #root,
            #root > div {
              margin: 0;
              padding: 0;
              min-height: 100vh;
              max-width: 100vw;
            }
          `}
        />
        <Global
          styles={{
            'body.noScroll': {
              // Prevent scrolling; conditionally activate this
              // in subcomponents when necessary ...
              overflow: 'hidden'
            }
          }}
        />
      </Flex>
    );
  }
}

export default connect(
  state => ({
    loggedIn: state.auth.loggedIn,
    alertMessage: state.common.alertMessage,
    alertType: state.common.alertType
  }),
  dispatch => ({
    clearAlerts: () => dispatch(commonOperations.alertClear())
  })
)(AppComponent);
