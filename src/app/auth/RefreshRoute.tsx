import React from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';
import { ICluster } from '../cluster/duck/types';

interface IProps {
  component: React.ReactNode;
  isLoggedIn: boolean;
}

const RefreshRoute: React.FunctionComponent<IProps & RouteComponentProps> = ({
  component: Component,
  isLoggedIn,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      isLoggedIn ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/',
          }}
        />
      )
    }
  />
);

export default RefreshRoute;
