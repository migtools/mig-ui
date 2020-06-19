import React from 'react';
import { connect } from 'react-redux';
import { CogIcon, UserIcon } from '@patternfly/react-icons';
import openshiftLogo from './CAM_LOGO.svg';
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
const styles = require('./PageHeaderComponent.module');

interface PageHeaderComponentProps extends Omit<PageHeaderProps, 'logo'> {
  isAdmin: boolean;
  setNamespaceSelectIsOpen?: (val) => void;
}

// NATODO: Remove WIP header
// const PageHeaderComPonent: React.FunctionComponent<PageHeaderComponentProps> = (props, isAdmin) => {
const PageHeaderComponent = ({ setNamespaceSelectisOpen, isAdmin, ...props }) => {
  return (
    <PageHeader
      toolbar={
        <Toolbar>
          <ToolbarGroup>
            {isAdmin !== null && (
              <ToolbarItem>
                <IconWithText icon={<UserIcon />} text={isAdmin ? 'Admin' : 'Non-admin'} />
              </ToolbarItem>
            )}
          </ToolbarGroup>

          <ToolbarGroup
            className={css(accessibleStyles.screenReader, accessibleStyles.visibleOnLg)}
          >
            <ToolbarItem>
              <Button
                id="default-example-uid-02"
                aria-label="Settings actions"
                variant={ButtonVariant.plain}
                onClick={() => {
                  setNamespaceSelectisOpen(true);
                }}
              >
                <CogIcon />
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </Toolbar>
      }
      logo={
        <>
          <Brand className={styles.logoPointer} src={openshiftLogo} alt="OpenShift Logo" />
          <Title
            size="2xl"
            style={{ marginLeft: 40, backgroundColor: 'red', color: 'white', padding: 10 }}
          >
            WORK IN PROGRESS
          </Title>
        </>
      }
    />
  );
};

const mapStateToProps = (state: IReduxState) => ({ isAdmin: state.auth.isAdmin });
const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(PageHeaderComponent);
