/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import HomeComponent from './home/HomeComponent';
import LoginComponent from './auth/LoginComponent';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './auth/PrivateRoute';
import { connect } from 'react-redux';
import { history } from '../helpers';
import { commonOperations } from './common/duck';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'emotion-theming';
import theme from '../theme';
import { Flex, Box } from '@rebass/emotion';
import { Global, css } from '@emotion/core';
import styled from '@emotion/styled';
import { Alert } from '@patternfly/react-core';

interface IProps {
  isLoggedIn?: boolean;
  errorMessage: any;
  successMessage: any;
  alertType: string;
  onRedirect: () => void;
}
const NotificationContainer = styled(Box)`
  position: absolute;
  z-index: 9999999;
  align-self: center;
`;
const AppComponent: React.SFC<IProps> = ({
  errorMessage,
  successMessage,
  alertType,
  isLoggedIn,
}) => (
  <Flex flexDirection="column" width="100%">
    {errorMessage && (
      <NotificationContainer>
        <Alert variant="danger" title={errorMessage} />
      </NotificationContainer>
    )}
    {successMessage && (
      <NotificationContainer>
        <Alert variant="success" title={successMessage} />
      </NotificationContainer>
    )}

    <Box>
      <ThemeProvider theme={theme}>
        <ConnectedRouter history={history}>
          <Switch>
            <PrivateRoute exact path="/" isLoggedIn={isLoggedIn} component={HomeComponent} />
            <Route path="/login" component={LoginComponent} />
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
          background-color: #ededed;
        }
      `}
    />
    <Global
      styles={{
        'body.noScroll': {
          // Prevent scrolling; conditionally activate this
          // in subcomponents when necessary ...
          overflow: 'hidden',
        },
      }}
    />
  </Flex>
);

export default connect(
  state => ({
    isLoggedIn: !!state.auth.user,
    errorMessage: state.common.errorText,
    successMessage: state.common.successText,
  }),
  dispatch => ({
    clearAlerts: () => dispatch(commonOperations.alertClear()),
  })
)(AppComponent);
