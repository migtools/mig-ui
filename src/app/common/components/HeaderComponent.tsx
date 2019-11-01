import React from 'react';
import {
  Brand,
  PageHeader,
} from '@patternfly/react-core';
// import openshiftLogo from '../../../assets/Logo-Cluster_Application_Migration.svg';
import openshiftLogo from '../../../assets/CAM_LOGO.svg';

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
