import React, { useEffect, useContext, useState } from 'react';
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
import ActiveNamespaceModal from '../common/components/ActiveNamespaceModal';
import { getActiveNamespaceFromStorage } from '../common/helpers';
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
  activeNamespace: string;
}

const HomeComponent: React.FunctionComponent<IHomeComponentProps> = ({
  clusterList,
  isHideWelcomeScreen,
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
  const activeNamespace = getActiveNamespaceFromStorage();
  const [namespaceSelectIsOpen, setNamespaceSelectIsOpen] = useState(false);

  return (
    <Page
      header={
        <PageHeaderComponent
          showNavToggle={!isWelcomeScreen}
          openNamespaceSelect={() => setNamespaceSelectIsOpen(true)}
          isWelcomeScreen={isWelcomeScreen}
        />
      }
      sidebar={<PageSidebar nav={nav} isNavOpen={!isWelcomeScreen} theme="dark" />}
      isManagedSidebar={!isWelcomeScreen}
      skipToContent={<SkipToContent href={`#${mainContainerId}`}>Skip to content</SkipToContent>}
      mainContainerId={mainContainerId}
    >
      <ActiveNamespaceModal
        isOpen={namespaceSelectIsOpen}
        onClose={() => setNamespaceSelectIsOpen(false)}
      />

      <Switch>
        <Route exact path="/">
          {!isHideWelcomeScreen || !activeNamespace ? (
            <Redirect to="/welcome" />
          ) : (
            <Redirect to="/clusters" />
          )}
        </Route>
        <Route exact path="/welcome">
          <WelcomePage openNamespaceSelect={() => setNamespaceSelectIsOpen(true)} />
        </Route>
        <Route path="*">
          {activeNamespace ? (
            // Don't render any route other than /welcome until the user selects a namespace
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
              <Route path="*">
                <Redirect to="/" />
              </Route>
            </Switch>
          ) : (
            <Redirect to="/" />
          )}
        </Route>
      </Switch>
    </Page>
  );
};

const mapStateToProps = (state: IReduxState) => ({
  isHideWelcomeScreen: state.auth.isHideWelcomeScreen,
});

export default connect(mapStateToProps, (dispatch) => ({
  onLogout: () => console.debug('TODO: IMPLEMENT: user logged out.'),
}))(HomeComponent);
