import React from 'react';
import { PageSection, Grid, GridItem } from '@patternfly/react-core';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import LogsContainer from './components/LogsContainer';

interface IProps {
  match: any;
}

export const LogsPage: React.FunctionComponent<IProps> = ({ match }) => {
  return (
    <>
      <PageSection>
        <Grid hasGutter>
          <GridItem>
            <Breadcrumb>
              <BreadcrumbItem>
                <Link to="/">Home</Link>
              </BreadcrumbItem>
              <BreadcrumbItem to="#" isActive>
                {match.params.planId} Logs
              </BreadcrumbItem>
            </Breadcrumb>
          </GridItem>
        </Grid>
      </PageSection>
      <PageSection>
        <LogsContainer planName={match.params.planId} />
      </PageSection>
    </>
  );
};
