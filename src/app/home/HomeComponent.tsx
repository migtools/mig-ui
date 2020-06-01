import React, { useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import { useRouteMatch, Link, Switch, Route, Redirect } from 'react-router-dom';
import {
  Nav,
  NavList,
  NavItem,
  Page,
  PageSidebar,
  SkipToContent,
  PageHeader,
  Brand,
} from '@patternfly/react-core';
import { PollingContext } from '../home/duck/context';
import { ClustersPage, StoragesPage, PlansPage, LogsPage } from './pages';
import RefreshRoute from '../auth/RefreshRoute';
import openshiftLogo from '../common/components/CAM_LOGO.svg';
const styles = require('./HomeComponent.module');

const mainContainerId = 'mig-ui-page-main-container';

const NavItemLink: React.FunctionComponent<{ to: string; label: string }> = ({ to, label }) => {
  const match = useRouteMatch({ path: to });
  return (
    <NavItem isActive={!!match}>
      <Link to={to}>{label}</Link>
    </NavItem>
  );
};

interface IHomeComponentProps {
  clusterList: any[]; // TODO
}

const HomeComponent: React.FunctionComponent<IHomeComponentProps> = ({
  clusterList,
}: IHomeComponentProps) => {
  const pollingContext = useContext(PollingContext);
  useEffect(() => {
    pollingContext.startAllDefaultPolling();
  }, []);

  const header = (
    <PageHeader
      logo={<Brand className={styles.logoPointer} src={openshiftLogo} alt="OpenShift Logo" />}
      showNavToggle
    />
  );

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
      header={header}
      sidebar={<PageSidebar nav={nav} theme="dark" />}
      isManagedSidebar
      skipToContent={<SkipToContent href={`#${mainContainerId}`}>Skip to content</SkipToContent>}
      mainContainerId={mainContainerId}
    >
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
        <RefreshRoute
          exact
          path="/logs/:planId"
          clusterList={clusterList}
          isLoggedIn
          component={LogsPage}
        />
      </Switch>
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
