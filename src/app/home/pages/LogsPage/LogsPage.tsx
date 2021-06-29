import React from 'react';
import { PageSection, Grid, GridItem } from '@patternfly/react-core';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Link, useParams } from 'react-router-dom';
import LogsContainer from './components/LogsContainer';
interface ILogsPageParams {
  planId: string;
}

export const LogsPage: React.FunctionComponent = () => {
  const { planId } = useParams<ILogsPageParams>();
  return (
    <>
      <PageSection>
        <Grid hasGutter>
          <GridItem>
            <Breadcrumb>
              <BreadcrumbItem>
                <Link to="/plans">plans</Link>
              </BreadcrumbItem>
              <BreadcrumbItem to="#" isActive>
                {planId} Logs
              </BreadcrumbItem>
            </Breadcrumb>
          </GridItem>
        </Grid>
      </PageSection>
      <PageSection>
        <LogsContainer planName={planId} />
      </PageSection>
    </>
  );
};
