import React from 'react';
import {
  Brand,
  PageHeader,
} from '@patternfly/react-core';
import openshiftLogo from './CAM_LOGO.svg';
const styles = require('./HeaderComponent.module');

const HeaderComponent = (
  <PageHeader
    logo={
      <Brand className={styles.logoPointer} src={openshiftLogo} alt="OpenShift Logo" />
    }
  />
);

export default HeaderComponent;
