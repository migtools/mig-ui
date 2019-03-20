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
import { AlertCard } from './common/components/AlertCard';

interface IProps {
  loggedIn?: boolean;
  alertMessage: string;
  alertType: string;
  onRedirect: () => void;
}

const AppComponent: React.SFC<IProps> = ({
  alertMessage,
  alertType,
  loggedIn,
}) => (
  <Flex flexDirection="column" width="100%">
    {alertMessage && (
      <Box alignSelf="center">
        <AlertCard
          fontSize={3}
          fontWeight="bold"
          width={1}
          p={4}
          mt={10}
          bg="#f6f6ff"
          borderRadius={8}
          color={alertType === 'error' ? 'red' : 'green'}
        >
          {alertMessage}
        </AlertCard>
      </Box>
    )}

    <Box>
      <ThemeProvider theme={theme}>
        <ConnectedRouter history={history}>
          <Switch>
            <PrivateRoute exact path="/" component={HomeComponent} />
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
    loggedIn: state.auth.loggedIn,
    alertMessage: state.common.alertMessage,
    alertType: state.common.alertType,
  }),
  dispatch => ({
    clearAlerts: () => dispatch(commonOperations.alertClear()),
  }),
)(AppComponent);
