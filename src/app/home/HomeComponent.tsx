import React, { useEffect, useContext } from 'react';
import { history } from '../../helpers';
import { connect } from 'react-redux';
import { useRouteMatch, Link, Switch, Route, Redirect } from 'react-router-dom';
import { IReduxState } from '../../reducers';
import { Nav, NavList, NavItem, Page, PageSidebar, SkipToContent } from '@patternfly/react-core';
import { PollingContext } from '../home/duck/context';
import { ClustersPage, StoragesPage, PlansPage, LogsPage, TokensPage, WelcomePage } from './pages';
import RefreshRoute from '../auth/RefreshRoute';
import { ICluster } from '../cluster/duck/types';
import PageHeaderComponent from '../common/components/PageHeaderComponent';
import { AuthActions } from '../auth/duck/actions';
import ActiveNamespaceModal from '../common/components/ActiveNamespaceModal';
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
  clusterList: ICluster[];
  isHideWelcomeScreen: boolean;
  setNamespaceSelectIsOpen: (val) => null;
  namespaceSelectIsOpen: boolean;
}

const HomeComponent: React.FunctionComponent<IHomeComponentProps> = ({
  clusterList,
  isHideWelcomeScreen,
  setNamespaceSelectIsOpen,
  namespaceSelectIsOpen,
}: IHomeComponentProps) => {
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
        <NavItemLink to="/tokens" label="Tokens" />
      </NavList>
    </Nav>
  );
  const isWelcomeScreen = history.location.pathname === '/welcome';

  return (
    <Page
      header={
        <PageHeaderComponent
          showNavToggle={!isWelcomeScreen}
          setNamespaceSelectIsOpen={setNamespaceSelectIsOpen}
          isWelcomeScreen={isWelcomeScreen}
        />
      }
      sidebar={<PageSidebar nav={nav} isNavOpen={!isWelcomeScreen} theme="dark" />}
      isManagedSidebar={!isWelcomeScreen}
      skipToContent={<SkipToContent href={`#${mainContainerId}`}>Skip to content</SkipToContent>}
      mainContainerId={mainContainerId}
    >
      <ActiveNamespaceModal namespaceSelectIsOpen={namespaceSelectIsOpen} />

      <Switch>
        <Route exact path="/">
          {/* NATODO: Are we showing the welcome screen for all users? */}
          {isHideWelcomeScreen ? <ClustersPage /> : <Redirect to="/welcome" />}
        </Route>
        <Route exact path="/welcome">
          <WelcomePage />
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
        <Route exact path="/tokens">
          <TokensPage />
        </Route>
      </Switch>
    </Page>
  );
};

// TODO does this component need to be connected to redux? Leaving for the onLogout stub.
const mapStateToProps = (state: IReduxState) => ({
  isHideWelcomeScreen: state.auth.isHideWelcomeScreen,
  namespaceSelectIsOpen: state.auth.namespaceSelectIsOpen,
});

export default connect(mapStateToProps, (dispatch) => ({
  onLogout: () => console.debug('TODO: IMPLEMENT: user logged out.'),
  setNamespaceSelectIsOpen: (val) => dispatch(AuthActions.setNamespaceSelectIsOpen(val)),
}))(HomeComponent);
