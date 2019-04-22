import React from 'react';
import { connect } from 'react-redux';
import { Flex, Box } from '@rebass/emotion';
import {
  Brand,
  Toolbar,
  ToolbarGroup,
  Button,
  ToolbarItem,
  Dropdown,
  ButtonVariant,
  DropdownItem,
  KebabToggle,
  DropdownToggle,
  Page,
  PageHeader,
  PageSidebar,
  Nav,
  NavList,
  NavExpandable,
  NavItem,
  PageSection,
  TextContent,
  Title,
} from '@patternfly/react-core';
import { BellIcon, CogIcon, AddCircleOIcon } from '@patternfly/react-icons';
import { clusterOperations } from '../cluster/duck';
import { storageOperations } from '../storage/duck';
import DetailViewComponent from './DetailViewComponent';
import CardComponent from './components/CardComponent';
import EmptyStateComponent from './components/EmptyStateComponent';
import Loader from 'react-loader-spinner';
import openShiftLogo from '../../assets/OpenShiftLogo.svg';
import theme from '../../theme';
import { css } from '@emotion/core';
import styled from '@emotion/styled';

interface IProps {
  loggingIn?: boolean;
  user: any;
  clusterList: any[];
  migStorageList: any[];
  migPlanList: any[];
  fetchClusters: () => void;
  fetchStorage: () => void;
  onLogout: () => void;
  isFetchingClusters: boolean;
  isFetchingStorage: boolean;
  isFetchingPlans: boolean;
}

interface IState {
  isDropdownOpen?: boolean;
  isKebabDropdownOpen?: boolean;
  isNavOpen?: boolean;
  activeGroup: string;
  activeItem: string;
}
class HomeComponent extends React.Component<IProps, IState> {
  state = {
    isDropdownOpen: false,
    isKebabDropdownOpen: false,
    isNavOpen: false,
    activeGroup: 'grp-1',
    activeItem: 'grp-1_itm-1',
  };

  componentDidMount() {
    // this.props.fetchClusters();
    // this.props.fetchStorage();
  }

  onNavSelect = result => {
    this.setState({
      activeItem: result.itemId,
    });
  }

  onDropdownToggle = isDropdownOpen => {
    this.setState({
      isDropdownOpen,
    });
  }

  onDropdownSelect = event => {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen,
    });
  }

  onKebabDropdownToggle = isKebabDropdownOpen => {
    this.setState({
      isKebabDropdownOpen,
    });
  }

  onKebabDropdownSelect = event => {
    this.setState({
      isKebabDropdownOpen: !this.state.isKebabDropdownOpen,
    });
  }

  kebabDropdownItems = [
    <DropdownItem key="0">
      <BellIcon /> Notifications
    </DropdownItem>,
    <DropdownItem key="1">
      <CogIcon /> Settings
    </DropdownItem>,
  ];

  userDropdownItems = [
    <DropdownItem key="0" onClick={this.props.onLogout}>
      Logout
    </DropdownItem>,
  ];

  render() {
    const { user } = this.props;
    const {
      isKebabDropdownOpen,
      isDropdownOpen,
      activeItem,
      activeGroup,
      isNavOpen,
    } = this.state;
    const PageNav = (
      <Nav onSelect={this.onNavSelect} aria-label="Nav">
        <NavList>
          <NavExpandable
            title="System Panel"
            groupId="grp-1"
            isActive={activeGroup === 'grp-1'}
            isExpanded
          >
            <NavItem
              to="#expandable-1"
              groupId="grp-1"
              itemId="grp-1_itm-1"
              isActive={activeItem === 'grp-1_itm-1'}
            >
              Overview
            </NavItem>
          </NavExpandable>
        </NavList>
      </Nav>
    );
    const PageToolbar = (
      <Toolbar>
        <ToolbarGroup>
          <ToolbarItem>
            <Button
              id="default-example-uid-01"
              aria-label="Notifications actions"
              variant={ButtonVariant.plain}
            >
              <BellIcon />
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              id="default-example-uid-02"
              aria-label="Settings actions"
              variant={ButtonVariant.plain}
            >
              <CogIcon />
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem>
            <Dropdown
              isPlain
              position="right"
              onSelect={this.onKebabDropdownSelect}
              toggle={<KebabToggle onToggle={this.onKebabDropdownToggle} />}
              isOpen={isKebabDropdownOpen}
              dropdownItems={this.kebabDropdownItems}
            />
          </ToolbarItem>
          <ToolbarItem>
            <Dropdown
              isPlain
              position="right"
              onSelect={this.onDropdownSelect}
              isOpen={isDropdownOpen}
              toggle={
                <DropdownToggle onToggle={this.onDropdownToggle}>
                  {/* <div>{user.username}</div> */}
                  <div>testuser123</div>
                </DropdownToggle>}
              dropdownItems={this.userDropdownItems}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
    const HeaderOverrideCss = css`
      background-color: #4d5057 !important;
      .pf-c-page__header-brand {
        background-color: #4d5057 !important;
      }
      -moz-box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
      -webkit-box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
      box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
    `;
    const BrandBar = styled.div`
      width: 1px;
      background-color: ${theme.colors.navy};
      height: 45px;
      float: left;
      border: 1px inset;
      margin-right: 1em;
      `;


    const Header = (
      <PageHeader
        logo={
          <React.Fragment>
            <Brand src={openShiftLogo} alt="OpenShift Logo" />
            <BrandBar
            />
          </React.Fragment>
        }

        toolbar={PageToolbar}
        //@ts-ignore
        css={HeaderOverrideCss}
      />
    );
    const Sidebar = <PageSidebar nav={PageNav} isNavOpen={isNavOpen} />;
    const {
      isFetchingStorage,
      isFetchingClusters,
      isFetchingPlans,
      migStorageList,
      migPlanList,
      clusterList,
    } = this.props;
    return (
      <React.Fragment>
        <Page header={Header}>
          <PageSection>
            <TextContent>
              <Flex justifyContent="center" flexWrap="wrap">
                <CardComponent
                  type="cluster"
                  title="Clusters"
                  dataList={clusterList}
                  isFetching={isFetchingClusters}
                />
                <CardComponent
                  title="Replication Repositories"
                  dataList={migStorageList}
                  isFetching={isFetchingStorage}
                />
                <CardComponent
                  title="Migration Plans"
                  dataList={migPlanList}
                  isFetching={isFetchingPlans}
                />
              </Flex>
            </TextContent>
          </PageSection>
          <PageSection>
            <Flex justifyContent="center">
                <Box flex="0 0 100%">
                  <DetailViewComponent />
                </Box>
            </Flex>
          </PageSection>
        </Page>
      </React.Fragment>
    );
  }
}

export default connect(
  state => ({
    loggingIn: state.auth.loggingIn,
    user: state.auth.user,
    isFetchingClusters: state.cluster.isFetching,
    isFetchingStorage: state.storage.isFetching,
    isFetchingPlans: state.plan.isFetching,
    clusterList: state.cluster.clusterList,
    migStorageList: state.storage.migStorageList,
    migPlanList: state.plan.migPlanList,
  }),
  dispatch => ({
    onLogout: () => console.debug('TODO: IMPLEMENT: user logged out.'),
    fetchClusters: () => dispatch(clusterOperations.fetchClusters()),
    fetchStorage: () => dispatch(storageOperations.fetchStorage()),
  }),
)(HomeComponent);
