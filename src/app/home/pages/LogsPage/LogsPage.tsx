import React from 'react';
import { PageSection } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Link, useParams } from 'react-router-dom';
import LogsContainer from './components/LogsContainer';
import GlobalPageHeader from '../../../common/components/GlobalPageHeader/GlobalPageHeader';
interface ILogsPageParams {
  planId: string;
}

export const LogsPage: React.FunctionComponent = () => {
  const { planId } = useParams<ILogsPageParams>();
  return (
    <>
      <GlobalPageHeader title="Logs">
        <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
          <BreadcrumbItem>
            <Link to="/plans">plans</Link>
          </BreadcrumbItem>
          <BreadcrumbItem to="#" isActive>
            {planId} Logs
          </BreadcrumbItem>
        </Breadcrumb>
      </GlobalPageHeader>
      <PageSection>
        <LogsContainer planName={planId} />
      </PageSection>
    </>
  );
};
