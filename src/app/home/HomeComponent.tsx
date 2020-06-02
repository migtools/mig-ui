import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import { useRouteMatch, Link, Switch, Route, Redirect } from 'react-router-dom';
import { IReduxState } from '../../reducers';
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
import { ClustersPage, StoragesPage, PlansPage, LogsPage, TokensPage, WelcomePage } from './pages';
import RefreshRoute from '../auth/RefreshRoute';
import { ICluster } from '../cluster/duck/types';
import PageHeaderComponent from '../common/components/PageHeaderComponent';
import { AuthActions } from '../auth/duck/actions';

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
  isShowAgain: boolean;
  setNamespaceSelectIsOpen: (val) => null;
}

const HomeComponent: React.FunctionComponent<IHomeComponentProps> = ({
  clusterList,
  isShowAgain,
  setNamespaceSelectIsOpen,
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

  //NATODO only show the welcome screen on initial login
  const isFirstTimeLoggingIn = true;
  const [isShowNav, setIsShowNav] = useState(false);

  const handleGetStartedClick = () => {
    setIsShowNav(true);
  };
  return (
    <Page
      header={
        <PageHeaderComponent
          //NATODO only disable sidebar when welcome screen is shown
          // showNavToggle={isShowNav}
          setNamespaceSelectIsOpen={setNamespaceSelectIsOpen}
        />
      }
      sidebar={
        <PageSidebar
          nav={nav}
          //NATODO only disable sidebar when welcome screen is shown
          // isNavOpen={isShowNav}
          theme="dark"
        />
      }
      isManagedSidebar
      //NATODO only disable sidebar when welcome screen is shown
      // isManagedSidebar={isShowNav}
      skipToContent={<SkipToContent href={`#${mainContainerId}`}>Skip to content</SkipToContent>}
      mainContainerId={mainContainerId}
    >
      <Switch>
        <Route exact path="/">
          {/* NATODO: update this boolean to persist across multiple sessions. 
          Also depends on the isAdmin boolean for displaying.*/}
          {isShowAgain ? <Redirect to="/welcome" /> : <ClustersPage />}
        </Route>
        <Route exact path="/welcome">
          <WelcomePage handleGetStartedClick={handleGetStartedClick} />
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
  isShowAgain: state.auth.isShowAgain,
});

export default connect(mapStateToProps, (dispatch) => ({
  onLogout: () => console.debug('TODO: IMPLEMENT: user logged out.'),
  setNamespaceSelectIsOpen: (val) => dispatch(AuthActions.setNamespaceSelectIsOpen(val)),
}))(HomeComponent);
