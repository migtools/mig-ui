import React from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';

interface IProps {
  component: React.ReactNode;
  isLoggedIn: boolean;
  clusterList: any;
}

const RefreshRoute: React.FunctionComponent<IProps & RouteComponentProps> = ({
  component: Component,
  isLoggedIn,
  clusterList,
  ...rest
}) => (
  <Route
    {...rest}
    render={(props) =>
      isLoggedIn && clusterList.length > 0 ? (
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
