import React from 'react';
import {
  Brand,
  PageHeader,
} from '@patternfly/react-core';
import openshiftLogo from './CAM_LOGO.svg';

const HeaderComponent = (
  <PageHeader
    logo={
      <React.Fragment>
        <Brand src={openshiftLogo} alt="OpenShift Logo" />
      </React.Fragment>
    }
  />
);

export default HeaderComponent;
