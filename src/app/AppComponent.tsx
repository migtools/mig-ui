/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import HomeComponent from './home/HomeComponent';
import LogsComponent from './logs/LogsComponent';
import LoginComponent from './auth/LoginComponent';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './auth/PrivateRoute';
import { connect } from 'react-redux';
import { history } from '../helpers';
import {
  AlertActions
} from './common/duck/actions';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'emotion-theming';
import theme from '../theme';
import { Flex, Box } from '@rebass/emotion';
import { Global, css } from '@emotion/core';
import styled from '@emotion/styled';
import { Alert, AlertActionCloseButton } from '@patternfly/react-core';
import CertErrorComponent from './auth/CertErrorComponent';

interface IProps {
  isLoggedIn?: boolean;
  errorMessage: any;
  successMessage: any;
  progressMessage: any;
  alertType: string;
  clearAlerts: () => void;
}
const NotificationContainer = styled(Box)`
  position: fixed;
  z-index: 9999999;
  align-self: center;
`;

const AppComponent: React.SFC<IProps> = ({
  errorMessage,
  successMessage,
  progressMessage,
  alertType,
  isLoggedIn,
  clearAlerts,
}) => (
    <Flex flexDirection="column" width="100%">
      {progressMessage && (
        <NotificationContainer>
          <Alert
            variant="info"
            title={progressMessage}
            action={<AlertActionCloseButton onClose={clearAlerts} />}
          />
        </NotificationContainer>
      )}
      {errorMessage && (
        <NotificationContainer>
          <Alert
            variant="danger"
            title={errorMessage}
            action={<AlertActionCloseButton onClose={clearAlerts} />}
          />
        </NotificationContainer>
      )}
      {successMessage && (
        <NotificationContainer>
          <Alert
            variant="success"
            title={successMessage}
            action={<AlertActionCloseButton onClose={clearAlerts} />}
          />
        </NotificationContainer>
      )}

      <Box>
        <ThemeProvider theme={theme}>
          <ConnectedRouter history={history}>
            <Switch>
              <PrivateRoute exact path="/" isLoggedIn={isLoggedIn} component={HomeComponent} />
              <PrivateRoute path="/logs/:planId" isLoggedIn={isLoggedIn} component={LogsComponent} />
              <Route path="/login" component={LoginComponent} />
              <Route path="/cert-error" component={CertErrorComponent} />
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
    progressMessage: state.common.progressText,
  }),
  dispatch => ({
    clearAlerts: () => dispatch(AlertActions.alertClear()),
  })
)(AppComponent);
