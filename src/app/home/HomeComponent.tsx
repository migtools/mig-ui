import React from 'react';
import {
  Toolbar,
  ToolbarGroup,
  Button,
  ToolbarItem,
  Dropdown,
  ButtonVariant,
  DropdownItem,
  KebabToggle,
  DropdownToggle,
  BackgroundImage,
  Page,
  PageHeader,
  PageSidebar,
  Brand,
  Avatar,
  Nav,
  NavList,
  NavExpandable,
  NavItem,
  PageSection,
  TextContent,
  Title,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateSecondaryActions,
} from '@patternfly/react-core';
import { BellIcon, CogIcon, AddCircleOIcon } from '@patternfly/react-icons';
import CardComponent from './components/CardComponent';
import AddClusterModal from './components/AddClusterModal';
import DetailViewContainer from './DetailView/DetailViewContainer';

import './HomeComponent.css';

export default class HomeComponent extends React.Component<any, any> {
  state = {
    isDropdownOpen: false,
    isKebabDropdownOpen: false,
    isNavOpen: false,
    activeGroup: 'grp-1',
    activeItem: 'grp-1_itm-1',
    dataExists: true,
    isModalOpen: false,
  };

  handleModalToggle = () => {
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen,
    }));
  }

  componentDidMount() {
    this.props.fetchDataList('migrationClusterList');
    // this.props.fetchDataList("migrationPlansList");
    // this.props.fetchDataList("migrationStorageList");
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
      {/* <Button onClick={this.props.onLogout}>Logout</Button> */}
    </DropdownItem>,
  ];

  // bgImages = {
  //   [BackgroundImageSrc.lg]: "/assets/images/pfbg_1200.jpg",
  //   [BackgroundImageSrc.sm]: "/assets/images/pfbg_768.jpg",
  //   [BackgroundImageSrc.sm2x]: "/assets/images/pfbg_768@2x.jpg",
  //   [BackgroundImageSrc.xs]: "/assets/images/pfbg_576.jpg",
  //   [BackgroundImageSrc.xs2x]: "/assets/images/pfbg_576@2x.jpg",
  //   [BackgroundImageSrc.filter]:
  //     "/assets/images/background-filter.svg#image_overlay"
  // };

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
                  <div>{user}</div>
                </DropdownToggle>}
              dropdownItems={this.userDropdownItems}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
    const Header = (
      <PageHeader
        className="header-override"
        // logo={<Brand src={brandImgSrc} alt="Patternfly Logo" />}
        toolbar={PageToolbar}
        // avatar={<Avatar src={avatarImg} alt="Avatar image" />}
        showNavToggle
        isNavOpen={isNavOpen}
      />
    );
    const Sidebar = <PageSidebar nav={PageNav} isNavOpen={isNavOpen} />;

    return (
      <React.Fragment>
        {/* <BackgroundImage src={bgImages} /> */}
        <Page header={Header} sidebar={Sidebar}>
          <PageSection>
            <TextContent>
              <div className="home-container">
                <div className="card-container">
                  <CardComponent
                    title="Clusters"
                    dataList={this.props.migrationClusterList}
                  />
                  <CardComponent
                    title="Replication Repositories"
                    dataList={[]}
                  />
                  <CardComponent title="Migration Plans" dataList={[]} />
                </div>
              </div>
            </TextContent>
          </PageSection>
          <PageSection>
            <div className="detail-view-container">
              {this.state.dataExists ? (
                <div className="data-list-container">
                  <DetailViewContainer />
                </div>
              ) : (
                <div className="empty-state-container">
                  <EmptyState>
                    <EmptyStateIcon icon={AddCircleOIcon} />
                    <Title size="lg">
                      Add source and target clusters for the migration
                    </Title>
                    <Button variant="primary" onClick={this.handleModalToggle}>
                      Add Cluster
                    </Button>
                  </EmptyState>
                  <AddClusterModal
                    isModalOpen={this.state.isModalOpen}
                    onHandleModalToggle={this.handleModalToggle}
                  />
                </div>
              )}
            </div>
          </PageSection>
        </Page>
      </React.Fragment>
    );
  }
}
