import React, { useEffect } from 'react';
import HomeComponent from './app/home/HomeComponent';
import LoginHandlerComponent from './app/auth/LoginHandlerComponent';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from './app/auth/PrivateRoute';
import { history } from './helpers';
import { ConnectedRouter } from 'connected-react-router';
import AlertModal from './app/common/components/AlertModal';
import ErrorModal from './app/common/components/ErrorModal';
import { ICluster } from './app/cluster/duck/types';
import { IDebugTreeNode, RAW_OBJECT_VIEW_ROUTE } from './app/debug/duck/types';
import AuthErrorComponent from './app/auth/AuthErrorComponent';
import { PollingContextProvider } from './app/common/context/PollingContext';
import { ICommonReducerState } from './app/common/duck/slice';
import { useSelector } from 'react-redux';
import { IAuthReducerState } from './app/auth/duck/slice';
import { DefaultRootState } from './configureStore';

const AppRoutes: React.FunctionComponent = () => {
  const common: ICommonReducerState = useSelector((state: DefaultRootState) => state.common);
  const auth: IAuthReducerState = useSelector((state: DefaultRootState) => state.auth);
  return (
    <React.Fragment>
      <PollingContextProvider>
        <AlertModal alertMessage={common.progressText} alertType="info" />
        <AlertModal alertMessage={common.errorText} alertType="danger" />
        <AlertModal alertMessage={common.successText} alertType="success" />
        <AlertModal alertMessage={common.warnText} alertType="warning" />

        {common.errorModalObject && <ErrorModal errorModalObj={common.errorModalObject} isOpen />}
        <ConnectedRouter history={history}>
          <Switch>
            <Route path="/handle-login" component={LoginHandlerComponent} />
            <Route path="/auth-error" component={AuthErrorComponent} />
            <PrivateRoute path="/" isLoggedIn={!!auth.user} component={HomeComponent} />
          </Switch>
        </ConnectedRouter>
      </PollingContextProvider>
    </React.Fragment>
  );
};

export default AppRoutes;
