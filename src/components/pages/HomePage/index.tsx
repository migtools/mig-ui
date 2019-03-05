import React from "react";
import { userActions } from "../../../actions";

import { connect } from "react-redux";
import {
  Avatar,
  BackgroundImage,
  BackgroundImageSrc,
  Brand,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DropdownSeparator,
  Gallery,
  GalleryItem,
  KebabToggle,
  Nav,
  NavItem,
  NavList,
  Page,
  PageHeader,
  PageSection,
  PageSectionVariants,
  PageSidebar,
  TextContent,
  Text,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from "@patternfly/react-core";
import { BellIcon, CogIcon } from "@patternfly/react-icons";
import { css } from "@patternfly/react-styles";

class ConnectedHomePage extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      isDropdownOpen: false,
      isKebabDropdownOpen: false,
      activeItem: 0
    };
  }
  onLogout = () => {
    this.props.dispatch(userActions.logout());
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

  onNavSelect = result => {
    this.setState({
      activeItem: result.itemId
    });
  };
  render() {
    const { isDropdownOpen, isKebabDropdownOpen, activeItem } = this.state;

    const PageNav = (
      <Nav onSelect={this.onNavSelect} aria-label="Nav">
        <NavList>
          <NavItem to="#nav-link1" itemId={0} isActive={activeItem === 0}>
            System Panel
          </NavItem>
          <NavItem to="#nav-link2" itemId={1} isActive={activeItem === 1}>
            Policy
          </NavItem>
          <NavItem to="#nav-link3" itemId={2} isActive={activeItem === 2}>
            Authentication
          </NavItem>
          <NavItem to="#nav-link4" itemId={3} isActive={activeItem === 3}>
            Network Services
          </NavItem>
          <NavItem to="#nav-link5" itemId={4} isActive={activeItem === 4}>
            Server
          </NavItem>
        </NavList>
      </Nav>
    );
    const kebabDropdownItems = [
      <DropdownItem>
        <BellIcon /> Notifications
      </DropdownItem>,
      <DropdownItem>
        <CogIcon /> Settings
      </DropdownItem>
    ];
    const userDropdownItems = [
      <DropdownItem onClick={this.onLogout}>Logout</DropdownItem>
    ];
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
              dropdownItems={kebabDropdownItems}
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
                  Kyle Baker
                </DropdownToggle>
              }
              dropdownItems={userDropdownItems}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
    const bgImages = {
      [BackgroundImageSrc.lg]: "/assets/images/pfbg_1200.jpg",
      [BackgroundImageSrc.sm]: "/assets/images/pfbg_768.jpg",
      [BackgroundImageSrc.sm2x]: "/assets/images/pfbg_768@2x.jpg",
      [BackgroundImageSrc.xs]: "/assets/images/pfbg_576.jpg",
      [BackgroundImageSrc.xs2x]: "/assets/images/pfbg_576@2x.jpg",
      [BackgroundImageSrc.filter]:
        "/assets/images/background-filter.svg#image_overlay"
    };

    const Header = (
      <PageHeader
        // logo={<Brand src={brandImg} alt="Patternfly Logo" />}
        toolbar={PageToolbar}
        // avatar={<Avatar src={avatarImg} alt="Avatar image" />}
        showNavToggle
      />
    );
    const Sidebar = <PageSidebar nav={PageNav} />;
    return (
      <React.Fragment>
        <BackgroundImage src={bgImages} />
        <Page header={Header} sidebar={Sidebar} isManagedSidebar>
          <PageSection variant={PageSectionVariants.light}>
            <TextContent>
              <Text component="h1">Openshift Migration</Text>
              <Text component="p">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed at
                felis eget justo pellentesque sagittis. In ut quam ac metus
                laoreet facilisis. Vivamus iaculis diam at mauris viverra
                dapibus. Proin sollicitudin luctus fermentum. Fusce luctus
                ultrices suscipit. Curabitur sit amet imperdiet mi. Maecenas
                odio elit, interdum ut volutpat at, malesuada id enim. Mauris
                suscipit purus vitae erat feugiat efficitur. Etiam convallis,
                turpis at scelerisque suscipit, est diam auctor sapien, vel
                pretium turpis ipsum et sem.
              </Text>
            </TextContent>
          </PageSection>
          <PageSection>
            <Gallery gutter="md">
              {Array.apply(0, Array(10)).map((x, i) => (
                <GalleryItem key={i}>
                  <Card>
                    <CardBody>This is a card</CardBody>
                  </Card>
                </GalleryItem>
              ))}
            </Gallery>
          </PageSection>
        </Page>
      </React.Fragment>
    );
  }
}

export default connect()(ConnectedHomePage);
