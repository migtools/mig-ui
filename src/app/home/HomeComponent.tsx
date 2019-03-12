import React from "react";
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
  TextContent
} from "@patternfly/react-core";
import { BellIcon, CogIcon } from "@patternfly/react-icons";
import { Dimmer, Loader, Image, Segment } from "semantic-ui-react";

import "./HomeComponent.css";

export default class HomeComponent extends React.Component<any, any> {
  state = {
    isDropdownOpen: false,
    isKebabDropdownOpen: false,
    isNavOpen: false,
    activeGroup: "grp-1",
    activeItem: "grp-1_itm-1"
  };

  onNavSelect = result => {
    this.setState({
      activeItem: result.itemId
    });
  };

  onDropdownToggle = isDropdownOpen => {
    this.setState({
      isDropdownOpen
    });
  };

  onDropdownSelect = event => {
    this.setState({
      isDropdownOpen: !this.state.isDropdownOpen
    });
  };

  onKebabDropdownToggle = isKebabDropdownOpen => {
    this.setState({
      isKebabDropdownOpen
    });
  };

  onKebabDropdownSelect = event => {
    this.setState({
      isKebabDropdownOpen: !this.state.isKebabDropdownOpen
    });
  };
  kebabDropdownItems = [
    <DropdownItem>
      <BellIcon /> Notifications
    </DropdownItem>,
    <DropdownItem>
      <CogIcon /> Settings
    </DropdownItem>
  ];
  userDropdownItems = [
    <DropdownItem key="0" onClick={this.props.onLogout}>
      Logout
      {/* <Button onClick={this.props.onLogout}>Logout</Button> */}
    </DropdownItem>
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
      isNavOpen
    } = this.state;
    const PageNav = (
      <Nav onSelect={this.onNavSelect} aria-label="Nav">
        <NavList>
          <NavExpandable
            title="System Panel"
            groupId="grp-1"
            isActive={activeGroup === "grp-1"}
            isExpanded
          >
            <NavItem
              to="#expandable-1"
              groupId="grp-1"
              itemId="grp-1_itm-1"
              isActive={activeItem === "grp-1_itm-1"}
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
                  {user}
                </DropdownToggle>
              }
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
                <div className="flex-item">
                  <div className="title">Namespaces</div>
                </div>
                <div className="flex-item">
                  <div className="title">Migration Plans</div>
                </div>
                <div className="flex-item">
                  <div className="title">Replication Repositories</div>
                </div>
              </div>
            </TextContent>
          </PageSection>
        </Page>
      </React.Fragment>
    );
  }
}
