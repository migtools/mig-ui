import React from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';

interface IProps {
  component: React.ReactNode;
  isLoggedIn: boolean;
}

const PrivateRoute: React.SFC<IProps & RouteComponentProps> = ({
  component: Component,
  isLoggedIn,
  ...rest
}) => (
  <Route
    {...rest}
    render={props =>
      isLoggedIn? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location },
          }}
        />
      )
    }
  />
);

export default PrivateRoute;
