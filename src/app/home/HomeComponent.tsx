import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ClustersPage, StoragesPage, PlansPage, PlanDebugPage, LogsPage } from './pages';
import { NamespacesPage } from './pages/PlansPage/pages/NamespacesPage';
import RefreshRoute from '../auth/RefreshRoute';
import { MigrationsPage } from './pages/PlansPage/pages/MigrationsPage';
import { HooksPage } from './pages/HooksPage/HooksPage';
import RawDebugObjectView from '../debug/components/RawDebugObjectView';

const HomeComponent: React.FunctionComponent = () => {
  const debug = useSelector((state) => state.debug);
  return (
    <Switch>
      <Route exact path="/">
        <Redirect to="/clusters" />
      </Route>
      <Route path="*">
        <Switch>
          <Route exact path="/clusters">
            <ClustersPage />
          </Route>
          <Route exact path="/storages">
            <StoragesPage />
          </Route>
          <Route exact path="/plans">
            <PlansPage />
          </Route>
          <Route exact path="/plans/:planName/namespaces">
            <NamespacesPage />
          </Route>
          <Route path="/plans/:planName/migrations">
            <MigrationsPage />
            <PlanDebugPage />
            {debug.objJson && <RawDebugObjectView />}
          </Route>
          <Route exact path="/hooks">
            <HooksPage />
          </Route>
          <RefreshRoute exact path="/logs/:planId" isLoggedIn component={LogsPage} />
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Route>
    </Switch>
  );
};

export default HomeComponent;
