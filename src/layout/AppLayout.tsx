import * as React from 'react';
import { Link, NavLink, useRouteMatch, useLocation } from 'react-router-dom';
import { Nav, NavList, NavItem, Page, PageSidebar, SkipToContent } from '@patternfly/react-core';
import PageHeaderComponent from '../app/common/components/PageHeaderComponent';
import './global.scss';
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
  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };
  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };
  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };

  const Header = <PageHeaderComponent />;

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

  return (
    <Page
      mainContainerId="primary-app-container"
      header={Header}
      sidebar={<PageSidebar nav={nav} theme="dark" />}
      onPageResize={onPageResize}
      skipToContent={PageSkipToContent}
    >
      {children}
    </Page>
  );
};

export { AppLayout };
