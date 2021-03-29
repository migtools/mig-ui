import React from 'react';
import logoCrane from './logoCrane.svg';
import logoRedHat from './logoRedHat.svg';
import {
  Title,
  PageHeader,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
  PageHeaderTools,
} from '@patternfly/react-core';
import { APP_TITLE } from '../../../app/common/constants';
import { APP_BRAND, BrandType } from '../../global-flags';
const styles = require('./PageHeaderComponent.module').default;

const PageHeaderComponent: React.FunctionComponent = () => (
  <PageHeader
    logoComponent="span"
    headerTools={
      <PageHeaderTools>
        <PageHeaderToolsGroup>
          <PageHeaderToolsItem>
            <img
              src={APP_BRAND === BrandType.RedHat ? logoRedHat : logoCrane}
              alt="Logo"
              className={
                APP_BRAND === BrandType.RedHat ? styles.redhatLogoStyle : styles.craneLogoStyle
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
      </>
    }
  />
);

export default PageHeaderComponent;
