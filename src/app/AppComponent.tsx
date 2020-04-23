import React from 'react';
import HomeComponent from './home/HomeComponent';
import LogsComponent from './logs/LogsComponent';
import LoginComponent from './auth/LoginComponent';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './auth/PrivateRoute';
import RefreshRoute from './auth/RefreshRoute';
import { connect } from 'react-redux';
import { history } from '../helpers';
import { ConnectedRouter } from 'connected-react-router';
import CertErrorComponent from './auth/CertErrorComponent';
import { PollingContext } from './home/duck/context';
import { StatusPollingInterval } from './common/duck/sagas';
import { clusterSagas } from './cluster/duck';
import { storageSagas } from './storage/duck';
import { ClusterActions } from './cluster/duck/actions';
import { StorageActions } from './storage/duck/actions';
import { PlanActions } from './plan/duck/actions';
import planSagas from './plan/duck/sagas';
import AlertModal from './common/components/AlertModal';
import ErrorModal from './common/components/ErrorModal';

interface IProps {
  isLoggedIn?: boolean;
  errorMessage: any;
  errorModalObject: any;
  successMessage: any;
  progressMessage: any;
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

const AppComponent: React.SFC<IProps> = ({
  errorMessage,
  errorModalObject,
  successMessage,
  progressMessage,
  isLoggedIn,
  startPlanPolling,
  stopPlanPolling,
  startStoragePolling,
  stopStoragePolling,
  startClusterPolling,
  stopClusterPolling,
  updateClusters,
  updateStorages,
  updatePlans,
  clusterList,
}) => {
  const handlePlanPoll = (response) => {
    if (response) {
      updatePlans(response.updatedPlans);
      return true;
    }
    return false;
  };

  const handleClusterPoll = (response) => {
    if (response) {
      updateClusters(response.updatedClusters);
      return true;
    }
    return false;
  };

  const handleStoragePoll = (response) => {
    if (response) {
      updateStorages(response.updatedStorages);
      return true;
    }
    return false;
  };

  const startDefaultPlanPolling = () => {
    const planPollParams = {
      asyncFetch: planSagas.fetchPlansGenerator,
      callback: handlePlanPoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
      pollName: 'plan',
    };
    startPlanPolling(planPollParams);
  };

  const startDefaultClusterPolling = () => {
    const clusterPollParams = {
      asyncFetch: clusterSagas.fetchClustersGenerator,
      callback: handleClusterPoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
      pollName: 'cluster',
    };
    startClusterPolling(clusterPollParams);
  };

  const startDefaultStoragePolling = () => {
    const storagePollParams = {
      asyncFetch: storageSagas.fetchStorageGenerator,
      callback: handleStoragePoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
      pollName: 'storage',
    };
    startStoragePolling(storagePollParams);
  };

  return (
    <React.Fragment>
      <AlertModal alertMessage={progressMessage} alertType="info" />
      <AlertModal alertMessage={errorMessage} alertType="danger" />
      <AlertModal alertMessage={successMessage} alertType="success" />
      <PollingContext.Provider
        value={{
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
          },
        }}
      >
        <ErrorModal errorModalObj={errorModalObject} isOpen />

        <ConnectedRouter history={history}>
          <Switch>
            <PrivateRoute exact path="/" isLoggedIn={isLoggedIn} component={HomeComponent} />
            <RefreshRoute
              exact
              path="/logs/:planId"
              clusterList={clusterList}
              isLoggedIn={isLoggedIn}
              component={LogsComponent}
            />
            <Route path="/login" component={LoginComponent} />
            <Route path="/cert-error" component={CertErrorComponent} />
          </Switch>
        </ConnectedRouter>
      </PollingContext.Provider>
    </React.Fragment>
  );
};

export default connect(
  (state) => ({
    isLoggedIn: !!state.auth.user,
    errorMessage: state.common.errorText,
    errorModalObject: state.common.errorModalObject,
    successMessage: state.common.successText,
    progressMessage: state.common.progressText,
    clusterList: state.cluster.clusterList,
  }),
  (dispatch) => ({
    startPlanPolling: (params) => dispatch(PlanActions.startPlanPolling(params)),
    stopPlanPolling: () => dispatch(PlanActions.stopPlanPolling()),
    startStoragePolling: (params) => dispatch(StorageActions.startStoragePolling(params)),
    stopStoragePolling: () => dispatch(StorageActions.stopStoragePolling()),
    startClusterPolling: (params) => dispatch(ClusterActions.startClusterPolling(params)),
    stopClusterPolling: () => dispatch(ClusterActions.stopClusterPolling()),
    updateClusters: (updatedClusters) => dispatch(ClusterActions.updateClusters(updatedClusters)),
    updateStorages: (updatedStorages) => dispatch(StorageActions.updateStorages(updatedStorages)),
    updatePlans: (updatedPlans) => dispatch(PlanActions.updatePlans(updatedPlans)),
  })
)(AppComponent);
