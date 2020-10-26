import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import RedirectToLogin from './RedirectToLogin';

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
      isLoggedIn ? <Component {...props} {...componentProps} /> : <RedirectToLogin />
    }
  />
);

export default PrivateRoute;
