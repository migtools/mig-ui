/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect } from 'react';
import HomeComponent from './home/HomeComponent';
import LogsComponent from './logs/LogsComponent';
import LoginComponent from './auth/LoginComponent';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './auth/PrivateRoute';
import RefreshRoute from './auth/RefreshRoute';
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
import { PollingContext } from './home/duck/context';
import { StatusPollingInterval } from './common/duck/sagas';
import { clusterOperations } from './cluster/duck';
import { storageOperations } from './storage/duck';
import { planOperations } from './plan/duck';
import { ClusterActions } from './cluster/duck/actions';
import { StorageActions } from './storage/duck/actions';
import { PlanActions } from './plan/duck/actions';

interface IProps {
  isLoggedIn?: boolean;
  errorMessage: any;
  successMessage: any;
  progressMessage: any;
  alertType: string;
  clearAlerts: () => void;
  startPlanPolling: (params) => void;
  stopPlanPolling: () => void;
  startStoragePolling: (params) => void;
  stopStoragePolling: () => void;
  startClusterPolling: (params) => void;
  stopClusterPolling: () => void;
  updateClusters: (updatedClusters) => void;
  updateStorages: (updatedStorages) => void;
  updatePlans: (updatedPlans) => void;
  clusterList: any;
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
  startPlanPolling,
  stopPlanPolling,
  startStoragePolling,
  stopStoragePolling,
  startClusterPolling,
  stopClusterPolling,
  updateClusters,
  updateStorages,
  updatePlans,
  clusterList
}) => {
  const handlePlanPoll = response => {
    if (response && response.isSuccessful === true) {
      updatePlans(response.updatedPlans);
      return true;
    }
    return false;
  };

  const handleClusterPoll = response => {
    if (response && response.isSuccessful === true) {
      updateClusters(response.updatedClusters);
      return true;
    }
    return false;
  };

  const handleStoragePoll = response => {
    if (response && response.isSuccessful === true) {
      updateStorages(response.updatedStorages);
      return true;
    }
    return false;
  };

  const startDefaultPlanPolling = () => {
    const planPollParams = {
      asyncFetch: planOperations.fetchPlansGenerator,
      callback: handlePlanPoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
    };
    startPlanPolling(planPollParams);
  };

  const startDefaultClusterPolling = () => {
    const clusterPollParams = {
      asyncFetch: clusterOperations.fetchClustersGenerator,
      callback: handleClusterPoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
    };
    startClusterPolling(clusterPollParams);
  };

  const startDefaultStoragePolling = () => {
    const storagePollParams = {
      asyncFetch: storageOperations.fetchStorageGenerator,
      callback: handleStoragePoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
    };
    startStoragePolling(storagePollParams);
  };

  return (
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
        <PollingContext.Provider value={{
          startDefaultClusterPolling: () => startDefaultClusterPolling(),
          startDefaultStoragePolling: () => startDefaultStoragePolling(),
          startDefaultPlanPolling: () => startDefaultPlanPolling(),
          stopClusterPolling: () => stopClusterPolling(),
          stopStoragePolling: () => stopStoragePolling(),
          stopPlanPolling: () => stopPlanPolling(),
          startAllDefaultPolling: () => {
            startDefaultClusterPolling();
            startDefaultStoragePolling();
            startDefaultPlanPolling();
          },
          stopAllPolling: () => {
            stopClusterPolling();
            stopStoragePolling();
            stopPlanPolling();
          }
        }}>

          <ThemeProvider theme={theme}>
            <ConnectedRouter history={history}>
              <Switch>
                <PrivateRoute exact path="/" isLoggedIn={isLoggedIn} component={HomeComponent} />
                <RefreshRoute exact path="/logs/:planId"
                  clusterList={clusterList}
                  isLoggedIn={isLoggedIn}
                  component={LogsComponent}
                />
                <Route path="/login" component={LoginComponent} />
                <Route path="/cert-error" component={CertErrorComponent} />
              </Switch>
            </ConnectedRouter>
          </ThemeProvider>
        </PollingContext.Provider>

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
};

export default connect(
  state => ({
    isLoggedIn: !!state.auth.user,
    errorMessage: state.common.errorText,
    successMessage: state.common.successText,
    progressMessage: state.common.progressText,
    clusterList: state.cluster.clusterList
  }),
  dispatch => ({
    clearAlerts: () => dispatch(AlertActions.alertClear()),
    startPlanPolling: params => dispatch(PlanActions.startPlanPolling(params)),
    stopPlanPolling: () => dispatch(PlanActions.stopPlanPolling()),
    startStoragePolling: params => dispatch(StorageActions.startStoragePolling(params)),
    stopStoragePolling: () => dispatch(StorageActions.stopStoragePolling()),
    startClusterPolling: params => dispatch(ClusterActions.startClusterPolling(params)),
    stopClusterPolling: () => dispatch(ClusterActions.stopClusterPolling()),
    updateClusters: updatedClusters => dispatch(ClusterActions.updateClusters(updatedClusters)),
    updateStorages: updatedStorages => dispatch(StorageActions.updateStorages(updatedStorages)),
    updatePlans: updatedPlans => dispatch(PlanActions.updatePlans(updatedPlans)),

  })
)(AppComponent);
