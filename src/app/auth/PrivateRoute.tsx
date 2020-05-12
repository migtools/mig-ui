import React from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';

interface IProps {
  component: React.ReactNode;
  isLoggedIn: boolean;
  componentProps?: object;
}

const PrivateRoute: React.FunctionComponent<IProps & RouteComponentProps> = ({
  component: Component,
  isLoggedIn,
  componentProps = {},
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      isLoggedIn ? (
        <Component {...props} {...componentProps} />
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
