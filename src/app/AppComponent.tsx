import React, { useEffect } from 'react';
import HomeComponent from './home/HomeComponent';
import LoginHandlerComponent from './auth/LoginHandlerComponent';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './auth/PrivateRoute';
import { connect } from 'react-redux';
import { history } from '../helpers';
import { ConnectedRouter } from 'connected-react-router';
import OAuthLandingPage from './token/OAuthLandingPage';
import AlertModal from './common/components/AlertModal';
import ErrorModal from './common/components/ErrorModal';
import { ICluster } from './cluster/duck/types';
import { IDebugTreeNode, RAW_OBJECT_VIEW_ROUTE } from './debug/duck/types';
import RawDebugObjectView from './debug/components/RawDebugObjectView';
import AuthErrorComponent from './auth/AuthErrorComponent';
import { PollingContextProvider } from './common/context/PollingContext';
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

const AppComponent: React.FunctionComponent<IProps> = ({
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
            <Route path="/oauth-landing" component={OAuthLandingPage} />
            <PrivateRoute
              path={RAW_OBJECT_VIEW_ROUTE}
              isLoggedIn={isLoggedIn}
              component={RawDebugObjectView}
              componentProps={{ debugTree }}
            />
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
)(AppComponent);
