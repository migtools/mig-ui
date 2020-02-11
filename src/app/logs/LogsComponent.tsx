import React from 'react';
import {
  Page,
  PageSection,
  Grid,
  GridItem
} from '@patternfly/react-core';
import HeaderComponent from '../common/components/HeaderComponent';
import { Breadcrumb, BreadcrumbItem, BreadcrumbHeading } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import LogsContainer from './components/LogsContainer';

interface IProps {
  match: any;
}

const LogsComponent: React.FunctionComponent<IProps> = ({ match }) => {
  return (
    <Page header={HeaderComponent}>
      <PageSection>
        <Grid gutter="md">
          <GridItem>
            <Breadcrumb>
              <BreadcrumbItem>
                <Link to="/">Home</Link>
              </BreadcrumbItem>
              <BreadcrumbItem to="#" isActive>{match.params.planId} Logs</BreadcrumbItem>
            </Breadcrumb>
          </GridItem>
        </Grid>
      </PageSection>
      <PageSection>
        <LogsContainer planName={match.params.planId} />
      </PageSection>
    </Page>
  );
};

export default LogsComponent;
