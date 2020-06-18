import React from 'react';
import { connect } from 'react-redux';
import {
  PageHeader,
  Brand,
  PageHeaderProps,
  Title,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { UserIcon } from '@patternfly/react-icons';
import openshiftLogo from './CAM_LOGO.svg';
import IconWithText from './IconWithText';
import { IReduxState } from '../../../reducers';
const styles = require('./PageHeaderComponent.module');

interface PageHeaderComponentProps extends Omit<PageHeaderProps, 'logo'> {
  isAdmin: boolean;
}

// NATODO: Remove WIP header
const PageHeaderComponent: React.FunctionComponent<PageHeaderComponentProps> = ({
  isAdmin,
  ...props
}) => (
  <PageHeader
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
    toolbar={
      <Toolbar>
        <ToolbarGroup>
          {isAdmin !== null && (
            <ToolbarItem>
              <IconWithText icon={<UserIcon />} text={isAdmin ? 'Admin' : 'Non-admin'} />
            </ToolbarItem>
          )}
        </ToolbarGroup>
      </Toolbar>
    }
    {...props}
  />
);

const mapStateToProps = (state: IReduxState) => ({ isAdmin: state.auth.isAdmin });
const mapDispatchToProps = () => ({});
export default connect(mapStateToProps, mapDispatchToProps)(PageHeaderComponent);
