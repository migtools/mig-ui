import React, { useEffect } from 'react';
import HomeComponent from './app/home/HomeComponent';
import LoginHandlerComponent from './app/auth/LoginHandlerComponent';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './app/auth/PrivateRoute';
import { connect } from 'react-redux';
import { history } from './helpers';
import { ConnectedRouter } from 'connected-react-router';
import AlertModal from './app/common/components/AlertModal';
import ErrorModal from './app/common/components/ErrorModal';
import { ICluster } from './app/cluster/duck/types';
import { IDebugTreeNode, RAW_OBJECT_VIEW_ROUTE } from './app/debug/duck/types';
import RawDebugObjectView from './app/debug/components/RawDebugObjectView';
import AuthErrorComponent from './app/auth/AuthErrorComponent';
import { PollingContextProvider } from './app/common/context/PollingContext';
interface IProps {
  isLoggedIn?: boolean;
  warnMessage: any;
  errorMessage: any;
  errorModalObject: any;
  successMessage: any;
  progressMessage: any;
  clusterList: ICluster[];
  debugTree: IDebugTreeNode;
}

const AppRoutes: React.FunctionComponent<IProps> = ({
  errorMessage,
  errorModalObject,
  successMessage,
  progressMessage,
  warnMessage,
  isLoggedIn,
  clusterList,
  debugTree,
}) => {
  return (
    <React.Fragment>
      <PollingContextProvider>
        <AlertModal alertMessage={progressMessage} alertType="info" />
        <AlertModal alertMessage={errorMessage} alertType="danger" />
        <AlertModal alertMessage={successMessage} alertType="success" />
        <AlertModal alertMessage={warnMessage} alertType="warning" />
        {errorModalObject && <ErrorModal errorModalObj={errorModalObject} isOpen />}
        <ConnectedRouter history={history}>
          <Switch>
            <Route path="/handle-login" component={LoginHandlerComponent} />
            <Route path="/auth-error" component={AuthErrorComponent} />
            <PrivateRoute
              path="/"
              isLoggedIn={isLoggedIn}
              component={HomeComponent}
              componentProps={{ clusterList }}
            />
          </Switch>
        </ConnectedRouter>
      </PollingContextProvider>
    </React.Fragment>
  );
};

export default connect(
  (state) => ({
    isLoggedIn: !!state.auth.user,
    warnMessage: state.common.warnText,
    errorMessage: state.common.errorText,
    errorModalObject: state.common.errorModalObject,
    successMessage: state.common.successText,
    progressMessage: state.common.progressText,
    clusterList: state.cluster.clusterList,
    debugTree: state.debug.tree,
  }),
  () => ({})
)(AppRoutes);
