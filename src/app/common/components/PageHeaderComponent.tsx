import React from 'react';
import { PageHeader, Brand, PageHeaderProps, Title } from '@patternfly/react-core';
import openshiftLogo from './CAM_LOGO.svg';
const styles = require('./PageHeaderComponent.module');

type PageHeaderComponentProps = Omit<PageHeaderProps, 'logo'>;

// NATODO: Remove WIP header
const PageHeaderComponent: React.FunctionComponent<PageHeaderComponentProps> = (props) => (
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
    {...props}
  />
);

export default PageHeaderComponent;
