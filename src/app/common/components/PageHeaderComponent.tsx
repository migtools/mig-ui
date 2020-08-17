import React from 'react';
import { connect } from 'react-redux';
import { CogIcon, UserIcon } from '@patternfly/react-icons';
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
    toolbar={
      <Toolbar>
        <ToolbarGroup>
          {NON_ADMIN_ENABLED && isAdmin !== null && (
            <ToolbarItem>
              <IconWithText icon={<UserIcon />} text={isAdmin ? 'Admin' : 'Non-admin'} />
            </ToolbarItem>
          )}
        </ToolbarGroup>

        <ToolbarGroup className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnLg)}>
          {NON_ADMIN_ENABLED && !isWelcomeScreen && (
            <ToolbarItem>
              <Button
                id="default-example-uid-02"
                aria-label="Settings actions"
                variant={ButtonVariant.plain}
                onClick={openNamespaceSelect}
              >
                <CogIcon />
              </Button>
            </ToolbarItem>
          )}
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem>
            <img
              src={APP_BRAND === BrandType.RedHat ? logoRedHat : logoKonveyor}
              alt="Logo"
              className={styles.logoStyle}
            />
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    }
    logo={
      <>
        <Title className={styles.logoPointer} headingLevel="h1" size="2xl">
          {APP_TITLE}
        </Title>

        {NON_ADMIN_ENABLED && (
          <Title
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
