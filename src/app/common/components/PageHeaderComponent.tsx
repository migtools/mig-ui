import React from 'react';
import { PageHeader, Brand, PageHeaderProps } from '@patternfly/react-core';
import openshiftLogo from './CAM_LOGO.svg';
const styles = require('./PageHeaderComponent.module');

type PageHeaderComponentProps = Omit<PageHeaderProps, 'logo'>;

const PageHeaderComponent: React.FunctionComponent<PageHeaderComponentProps> = (props) => (
  <PageHeader
    logo={<Brand className={styles.logoPointer} src={openshiftLogo} alt="OpenShift Logo" />}
    {...props}
  />
);

export default PageHeaderComponent;
