import React from 'react';
import { connect } from 'react-redux';
import { Flex, Box } from '@rebass/emotion';
import styled from '@emotion/styled';
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
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { BellIcon, CogIcon } from '@patternfly/react-icons';
import { clusterOperations } from '../cluster/duck';
import { storageOperations } from '../storage/duck';
import { planOperations } from '../plan/duck';
import DetailViewComponent from './DetailViewComponent';
import DashboardCard from './components/Card/DashboardCard';
import clusterSelectors from '../cluster/duck/selectors';
import storageSelectors from '../storage/duck/selectors';
import planSelectors from '../plan/duck/selectors';

import openshiftLogo from '../../assets/Logo-Cluster_Application_Migration.svg';
interface IProps {
  loggingIn?: boolean;
  user: any;
  allClusters: any[];
  allStorage: any[];
  allPlans: any[];
  fetchPlans: () => void;
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

  componentDidMount = () => {
    this.props.fetchClusters();
    this.props.fetchStorage();
    this.props.fetchPlans();
  }

  render() {
    const {
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
            <Dropdown
              isPlain
              position="right"
              onSelect={this.onDropdownSelect}
              isOpen={isDropdownOpen}
              toggle={
                <DropdownToggle onToggle={this.onDropdownToggle}>
                  <div>jmatthews</div>
                </DropdownToggle>}
              dropdownItems={this.userDropdownItems}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
    const StyledPageHeader = styled(PageHeader)`
      .pf-c-brand{
        height: 2.5em;
      }
      background-color: #151515 !important;
      .pf-c-page__header-brand {
        background-color: #151515 !important;
        min-width: 56em;
      }
      -moz-box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
      -webkit-box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
      box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
      text-decoration: none;
      .pf-c-page__header-brand-link{
        text-decoration: none;
      }

    `;

    const Header = (
      <StyledPageHeader
        logo={
          <React.Fragment>
            <Brand src={openshiftLogo} alt="OpenShift Logo" />
          </React.Fragment>
        }
        toolbar={PageToolbar}
      />
    );
    const Sidebar = <PageSidebar nav={PageNav} isNavOpen={isNavOpen} />;
    const {
      isFetchingStorage,
      isFetchingClusters,
      isFetchingPlans,
      allStorage,
      allPlans,
      allClusters,
    } = this.props;
    const StyledPageSection = styled(PageSection)`
      padding-top: '50px';
    `;
    return (
      <React.Fragment>
        <Page header={Header}>
          <StyledPageSection
          >
            <Grid gutter="md">
              <GridItem span={4}>
                <DashboardCard
                  type="clusters"
                  title="Clusters"
                  dataList={allClusters}
                  isFetching={isFetchingClusters}
                />
              </GridItem>
              <GridItem span={4}>
                <DashboardCard
                  title="Replication Repositories"
                  type="repositories"
                  dataList={allStorage}
                  isFetching={isFetchingStorage}
                />
              </GridItem>
              <GridItem span={4}>
                <DashboardCard
                  type="plans"
                  title="Migration Plans"
                  dataList={allPlans}
                  isFetching={isFetchingPlans}
                />
              </GridItem>
            </Grid>
          </StyledPageSection>
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
    allClusters: clusterSelectors.getAllClusters(state),
    allStorage: storageSelectors.getAllStorage(state),
    allPlans: planSelectors.getAllPlans(state),
    filteredClusterList: clusterSelectors.getVisibleClusters(state),
    loggingIn: state.auth.loggingIn,
    user: state.auth.user,
    isFetchingClusters: state.cluster.isFetching,
    isFetchingStorage: state.storage.isFetching,
    isFetchingPlans: state.plan.isFetching,
  }),
  dispatch => ({
    onLogout: () => console.debug('TODO: IMPLEMENT: user logged out.'),
    fetchClusters: () => dispatch(clusterOperations.fetchClusters()),
    fetchStorage: () => dispatch(storageOperations.fetchStorage()),
    fetchPlans: () => dispatch(planOperations.fetchPlans()),
  }),
)(HomeComponent);
