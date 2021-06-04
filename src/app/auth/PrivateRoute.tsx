import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import RedirectToLogin from './RedirectToLogin';

interface IProps {
  component: React.FunctionComponent;
  isLoggedIn: boolean;
  componentProps?: object;
  path: string;
}

const PrivateRoute: React.FunctionComponent<IProps> = ({
  component: Component,
  isLoggedIn,
  componentProps = {},
  path,
  ...rest
}) => <Route {...rest} render={(props) => (isLoggedIn ? <Component /> : <RedirectToLogin />)} />;

export default PrivateRoute;
