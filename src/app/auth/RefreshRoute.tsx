import React from 'react';
import { Route, Redirect, RouteComponentProps, RouteProps } from 'react-router-dom';

interface IProps {
  component: React.FunctionComponent;
  isLoggedIn: boolean;
}

const RefreshRoute: React.FunctionComponent<IProps & RouteProps> = ({
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
