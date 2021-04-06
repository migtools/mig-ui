import * as React from 'react';
import { Link, NavLink, useRouteMatch, useLocation } from 'react-router-dom';
import {
  Nav,
  NavList,
  NavItem,
  Page,
  PageSidebar,
  SkipToContent,
  PageHeader,
  PageHeaderTools,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
  Title,
} from '@patternfly/react-core';
const styles = require('./AppLayout.module').default;
import logoCrane from './logoCrane.svg';
import logoRedHat from './logoRedHat.svg';
import './global.scss';
import { DOWNSTREAM_TITLE, UPSTREAM_TITLE } from '../app/common/constants';
import { APP_BRAND, BrandType } from '../app/global-flags';
import { RAW_OBJECT_VIEW_ROUTE } from '../app/debug/duck/types';
interface IAppLayout {
  children: React.ReactNode;
}

const NavItemLink: React.FunctionComponent<{ to: string; label: string }> = ({ to, label }) => {
  const match = useRouteMatch({ path: to });
  return (
    <NavItem isActive={!!match}>
      <Link to={to}>{label}</Link>
    </NavItem>
  );
};

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const [isNavOpen, setIsNavOpen] = React.useState(true);
  const [isMobileView, setIsMobileView] = React.useState(true);
  const [isNavOpenMobile, setIsNavOpenMobile] = React.useState(false);
  const isJSONScreen = !!useRouteMatch(RAW_OBJECT_VIEW_ROUTE);

  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };

  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };

  const Header = (
    <PageHeader
      logoComponent="span"
      showNavToggle={true}
      isNavOpen={isNavOpen}
      onNavToggle={onNavToggle}
      headerTools={
        <PageHeaderTools>
          <PageHeaderToolsGroup>
            <PageHeaderToolsItem>
              <img
                src={APP_BRAND === BrandType.RedHat ? logoRedHat : logoCrane}
                alt="Logo"
                className={
                  APP_BRAND === BrandType.RedHat ? styles.redhatLogoStyle : styles.craneLogoStyle
                }
              />
            </PageHeaderToolsItem>
          </PageHeaderToolsGroup>
        </PageHeaderTools>
      }
      logo={
        <>
          <Title className={styles.logoPointer} headingLevel="h1" size="2xl">
            {APP_BRAND === BrandType.RedHat ? DOWNSTREAM_TITLE : UPSTREAM_TITLE}
          </Title>
        </>
      }
    />
  );

  const nav = (
    <Nav aria-label="Page navigation" theme="dark">
      <NavList>
        <NavItemLink to="/clusters" label="Clusters" />
        <NavItemLink to="/storages" label="Replication repositories" />
        <NavItemLink to="/plans" label="Migration plans" />
        <NavItemLink to="/hooks" label="Hooks" />
      </NavList>
    </Nav>
  );
  const PageSkipToContent = (
    <SkipToContent href="#primary-app-container">Skip to Content</SkipToContent>
  );
  const Sidebar = (
    <PageSidebar
      className={styles.sidebarModifier}
      theme="dark"
      nav={nav}
      isNavOpen={!isJSONScreen && isNavOpen}
    />
  );
  return (
    <Page
      mainContainerId="primary-app-container"
      header={Header}
      sidebar={Sidebar}
      isManagedSidebar={!isJSONScreen}
      onPageResize={onPageResize}
      skipToContent={PageSkipToContent}
    >
      {children}
    </Page>
  );
};

export { AppLayout };
