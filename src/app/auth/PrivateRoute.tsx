import React from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';

interface IProps {
  loggedIn?: boolean;
  component: React.ReactNode;
}

const PrivateRoute: React.SFC<IProps & RouteComponentProps> = ({ component: Component, loggedIn, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      loggedIn ? (
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
