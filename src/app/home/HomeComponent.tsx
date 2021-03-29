import React from 'react';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import { ClustersPage, StoragesPage, PlansPage, PlanDebugPage, LogsPage } from './pages';
import { NamespacesPage } from './pages/PlansPage/pages/NamespacesPage';
import RefreshRoute from '../auth/RefreshRoute';
import { MigrationsPage } from './pages/PlansPage/pages/MigrationsPage';
import { HooksPage } from './pages/HooksPage/HooksPage';
import { MigrationDetailsPage } from './pages/PlansPage/pages/MigrationDetailsPage';
import { MigrationStepDetailsPage } from './pages/PlansPage/pages/MigrationStepDetailsPage/MigrationStepDetailsPage';

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
          <Route exact path="/plans">
            <PlansPage />
          </Route>
          <Route exact path="/plans/:planName/namespaces">
            <NamespacesPage />
          </Route>
          <Route exact path="/plans/:planName/migrations">
            <MigrationsPage />
          </Route>
          <Route exact path="/plans/:planName/migrations/:migrationID">
            <MigrationDetailsPage />
          </Route>
          <Route exact path="/plans/:planName/migrations/:migrationID/:stepName">
            <MigrationStepDetailsPage />
          </Route>
          <Route exact path="/plans/:planName/debug">
            <PlanDebugPage />
          </Route>
          <Route exact path="/hooks">
            <HooksPage />
          </Route>
          <RefreshRoute exact path="/logs/:planId" component={LogsPage} />
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Route>
    </Switch>
  );
};

export default HomeComponent;
