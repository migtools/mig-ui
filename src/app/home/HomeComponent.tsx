import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ClustersPage, StoragesPage, PlansPage, PlanDebugPage, LogsPage } from './pages';
import RefreshRoute from '../auth/RefreshRoute';
import { MigrationsPage } from './pages/PlansPage/pages/MigrationsPage';
import { HooksPage } from './pages/HooksPage/HooksPage';
import RawDebugObjectView from '../debug/components/RawDebugObjectView';
import { RAW_OBJECT_VIEW_ROUTE } from '../debug/duck/types';
import NamespacesPage from './pages/PlansPage/pages/NamespacesPage/NamespacesPage';
import { PlanContextProvider } from './context';

const HomeComponent: React.FunctionComponent = () => {
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
          <PlanContextProvider>
            <Route exact path="/plans">
              <PlansPage />
            </Route>
            <Route path="/plans/:planName/migrations">
              <MigrationsPage />
            </Route>
          </PlanContextProvider>
          <Route exact path="/plans/:planName/namespaces">
            <NamespacesPage />
          </Route>
          <Route exact path="/hooks">
            <HooksPage />
          </Route>
          <RefreshRoute exact path="/logs/:planId" isLoggedIn component={LogsPage} />
          <RefreshRoute path={RAW_OBJECT_VIEW_ROUTE} isLoggedIn component={RawDebugObjectView} />
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Route>
    </Switch>
  );
};

export default HomeComponent;
