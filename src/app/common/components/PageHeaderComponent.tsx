import React from 'react';
import { connect } from 'react-redux';
import CogIcon from '@patternfly/react-icons/dist/js/icons/cog-icon';
import UserIcon from '@patternfly/react-icons/dist/js/icons/user-icon';
import logoKonveyor from './logoKonveyor.svg';
import logoRedHat from './logoRedHat.svg';
import IconWithText from './IconWithText';
import { IReduxState } from '../../../reducers';
import {
  Title,
  PageHeader,
  Brand,
  PageHeaderProps,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  Button,
  ButtonVariant,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
  PageHeaderTools,
} from '@patternfly/react-core';
import accessibleStyles from '@patternfly/react-styles/css/utilities/Accessibility/accessibility';
import { css } from '@patternfly/react-styles';
import { NON_ADMIN_ENABLED } from '../../../TEMPORARY_GLOBAL_FLAGS';
import { APP_TITLE } from '../../../app/common/constants';
import { APP_BRAND, BrandType } from '../../global-flags';
const styles = require('./PageHeaderComponent.module');

interface PageHeaderComponentProps extends Omit<PageHeaderProps, 'logo'> {
  isAdmin: boolean;
  isWelcomeScreen: boolean;
  openNamespaceSelect: () => void;
}

// NATODO: Remove WIP header
const PageHeaderComponent: React.FunctionComponent<PageHeaderComponentProps> = ({
  isAdmin,
  openNamespaceSelect,
  isWelcomeScreen,
  ...props
}) => (
  <PageHeader
    logoComponent="span"
    headerTools={
      <PageHeaderTools>
        <PageHeaderToolsGroup>
          {NON_ADMIN_ENABLED && isAdmin !== null && (
            <PageHeaderToolsItem>
              <IconWithText icon={<UserIcon />} text={isAdmin ? 'Admin' : 'Non-admin'} />
            </PageHeaderToolsItem>
          )}
        </PageHeaderToolsGroup>
        <PageHeaderToolsGroup
          className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnLg)}
        >
          {NON_ADMIN_ENABLED && !isWelcomeScreen && (
            <PageHeaderToolsItem>
              <Button
                id="default-example-uid-02"
                aria-label="Settings actions"
                variant={ButtonVariant.plain}
                onClick={openNamespaceSelect}
              >
                <CogIcon />
              </Button>
            </PageHeaderToolsItem>
          )}
        </PageHeaderToolsGroup>
        <PageHeaderToolsGroup>
          <PageHeaderToolsItem>
            <img
              src={APP_BRAND === BrandType.RedHat ? logoRedHat : logoKonveyor}
              alt="Logo"
              className={
                APP_BRAND === BrandType.RedHat ? styles.redhatLogoStyle : styles.konveyorLogoStyle
              }
            />
          </PageHeaderToolsItem>
        </PageHeaderToolsGroup>
      </PageHeaderTools>
    }
    logo={
      <>
        <Title className={styles.logoPointer} headingLevel="h1" size="2xl">
          {APP_TITLE}
        </Title>

        {NON_ADMIN_ENABLED && (
          <Title
            headingLevel="h5"
            size="2xl"
            style={{ marginLeft: 40, backgroundColor: 'red', color: 'white', padding: 10 }}
          >
            WORK IN PROGRESS
          </Title>
        )}
      </>
    }
    {...props}
  />
);

const mapStateToProps = (state: IReduxState) => ({ isAdmin: state.auth.isAdmin });
const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(PageHeaderComponent);
