import React from 'react';
import styled from '@emotion/styled';
import {
  Brand,
  PageHeader,
} from '@patternfly/react-core';
import openshiftLogo from '../../../assets/Logo-Cluster_Application_Migration.svg';

const StyledPageHeader = styled(PageHeader)`
      .pf-c-brand {
        height: 2.5em;
      }
      background-color: #151515 !important;
      .pf-c-page__header-brand {
        background-color: #151515 !important;
        min-width: 56em;
      }
      -moz-box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
      -webkit-box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
      box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
      text-decoration: none;
      .pf-c-page__header-brand-link {
        text-decoration: none;
      }
    `;

const HeaderComponent = (
  <StyledPageHeader
    logo={
      <React.Fragment>
        <Brand src={openshiftLogo} alt="OpenShift Logo" />
      </React.Fragment>
    }
  />
);
export default HeaderComponent;