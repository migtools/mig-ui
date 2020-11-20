import React, { useContext, useEffect } from 'react';

import { useParams, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  PageSection,
  Title,
  Breadcrumb,
  EmptyState,
  BreadcrumbItem,
  Card,
  Bullseye,
  Spinner,
  CardBody,
} from '@patternfly/react-core';
import { Alert } from '@patternfly/react-core';

import { IReduxState } from '../../../../../../reducers';
import { PollingContext } from '../../../../duck/context';
import { IMigration, IPlan } from '../../../../../plan/duck/types';
import { planSelectors } from '../../../../../plan/duck';
import MigrationDetailsTable from './MigrationDetailsTable';
import { formatGolangTimestamp } from '../../helpers';

interface IMigrationDetailsPageProps {
  planList: IPlan[];
  isFetchingInitialPlans: boolean;
}

const BaseMigrationDetailsPage: React.FunctionComponent<IMigrationDetailsPageProps> = ({
  planList,
  isFetchingInitialPlans,
}: IMigrationDetailsPageProps) => {
  const pollingContext = useContext(PollingContext);
  useEffect(() => {
    pollingContext.startAllDefaultPolling();
  }, []);

  const { planName, migrationID } = useParams();
  const migration = planList
    .find((planItem: IPlan) => planItem.MigPlan.metadata.name === planName)
    ?.Migrations.find((migration: IMigration) => migration.metadata.name === migrationID);
const {tableStatus} = migration;
  const isWarningCondition = tableStatus.migrationState === 'warn';
  const isErrorCondition = tableStatus.migrationState === 'error';
  const type = migration?.spec?.stage ? 'Stage' : 'Final';
  return (
    <>
      <PageSection variant="light">
        <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
          <BreadcrumbItem>
            <Link to="/plans">Plans</Link>
          </BreadcrumbItem>
          <BreadcrumbItem to={`/plans/${planName}/migrations`}>{planName}</BreadcrumbItem>
          {!isFetchingInitialPlans && migration && (
            <BreadcrumbItem to="#" isActive>
              {type} - {formatGolangTimestamp(migration.status.startTimestamp)}
            </BreadcrumbItem>
          )}
        </Breadcrumb>
        <Title headingLevel="h1" size="2xl">
          Migration details
        </Title>
      </PageSection>
      {isWarningCondition && (
        <PageSection>
          <Alert
            variant="warning"
            isInline
            title="This migration has following warning conditions:"
          >
            {tableStatus.warnings.map((warning, idx) => {
              return (
                <>
                  {warning}
                  <br />
                </>
              );
            })}
          </Alert>
        </PageSection>
      )}
      {isErrorCondition && (
        <PageSection>
          <Alert variant="danger" isInline title="This migration has following error conditions:">
            {tableStatus.errors.map((error ) => {
              return (
                <>
                  {error}
                  <br />
                </>
              );
            })}
          </Alert>
        </PageSection>
      )}
      {!isFetchingInitialPlans && migration && migration.status?.pipeline ? (
        <PageSection>
          <Card>
            <CardBody>
              <MigrationDetailsTable migration={migration} id="migration-details-table" />
            </CardBody>
          </Card>
        </PageSection>
      ) : (
        <PageSection>
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        </PageSection>
      )}
    </>
  );
};

export const MigrationDetailsPage = connect((state: IReduxState) => ({
  planList: planSelectors.getPlansWithStatus(state),
  isFetchingInitialPlans: state.plan.isFetchingInitialPlans,
}))(BaseMigrationDetailsPage);
