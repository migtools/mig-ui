import React, { useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import { useRouteMatch, Link, Switch, Route, Redirect } from 'react-router-dom';
import {
  Nav,
  NavList,
  NavItem,
  Page,
  PageSidebar,
  PageSection,
  SkipToContent,
} from '@patternfly/react-core';
import HeaderComponent from '../common/components/HeaderComponent';
import { PollingContext } from '../home/duck/context';
import { ClustersPage, StoragesPage, PlansPage } from './pages';

const mainContainerId = 'mig-ui-page-main-container';

export enum DataListItems {
  ClusterList = 'clusterList',
  StorageList = 'storageList',
  PlanList = 'planList',
}

const NavItemLink: React.FunctionComponent<{ to: string; label: string }> = ({ to, label }) => {
  const match = useRouteMatch({ path: to });
  return (
    <NavItem isActive={!!match}>
      <Link to={to}>{label}</Link>
    </NavItem>
  );
};

const HomeComponent: React.FunctionComponent<{}> = () => {
  const pollingContext = useContext(PollingContext);
  useEffect(() => {
    pollingContext.startAllDefaultPolling();
  }, []);

  const nav = (
    <Nav aria-label="Page navigation" theme="dark">
      <NavList>
        <NavItemLink to="/clusters" label="Clusters" />
        <NavItemLink to="/storages" label="Replication repositories" />
        <NavItemLink to="/plans" label="Migration plans" />
      </NavList>
    </Nav>
  );

  return (
    <Page
      header={HeaderComponent}
      sidebar={<PageSidebar nav={nav} theme="dark" />}
      isManagedSidebar
      skipToContent={<SkipToContent href={`#${mainContainerId}`}>Skip to content</SkipToContent>}
      mainContainerId={mainContainerId}
    >
      <PageSection>
        <Switch>
          <Route exact path="/">
            <Redirect to="/clusters" />
          </Route>
          <Route exact path="/clusters">
            <ClustersPage />
          </Route>
          <Route exact path="/storages">
            <StoragesPage />
          </Route>
          <Route exact path="/plans">
            <PlansPage />
          </Route>
        </Switch>
      </PageSection>
    </Page>
  );
};

// TODO does this component need to be connected to redux? Leaving for the onLogout stub.
export default connect(
  (state) => ({}),
  (dispatch) => ({
    onLogout: () => console.debug('TODO: IMPLEMENT: user logged out.'),
  })
)(HomeComponent);
