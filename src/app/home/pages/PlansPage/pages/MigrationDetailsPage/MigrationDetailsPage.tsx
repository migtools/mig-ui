import React, { useEffect } from 'react';

import { useParams, Link, useRouteMatch } from 'react-router-dom';
import { useSelector } from 'react-redux';
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

import { IMigration, IPlan } from '../../../../../plan/duck/types';
import { planSelectors } from '../../../../../plan/duck';
import MigrationDetailsTable from './MigrationDetailsTable';
import { formatGolangTimestamp } from '../../helpers';
import { DefaultRootState } from '../../../../../../configureStore';

interface IMigrationDetailsPageParams {
  planName: string;
  migrationID: string;
}

export const MigrationDetailsPage: React.FunctionComponent = () => {
  const { planName, migrationID } = useParams<IMigrationDetailsPageParams>();
  const { path, url } = useRouteMatch();

  const planList = useSelector((state: DefaultRootState) =>
    planSelectors.getPlansWithStatus(state)
  );
  const migration = planList
    .find((planItem: IPlan) => planItem.MigPlan.metadata.name === planName)
    ?.Migrations.find((migration: IMigration) => migration.metadata.name === migrationID);
  const isPausedCondition = migration?.tableStatus.migrationState === 'paused';
  const isWarningCondition = migration?.tableStatus.migrationState === 'warn';
  const isErrorCondition = migration?.tableStatus.migrationState === 'error';
  const type = migration?.spec?.stage ? 'Stage' : 'Final';

  return (
    <>
      <PageSection variant="light">
        <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
          <BreadcrumbItem>
            <Link to="/plans">Plans</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={`/plans/${planName}/migrations`}>{planName}</Link>
          </BreadcrumbItem>
          {migration && (
            <BreadcrumbItem to="#" isActive>
              {type} - {formatGolangTimestamp(migration.status?.startTimestamp)}
            </BreadcrumbItem>
          )}
        </Breadcrumb>
        <Title headingLevel="h1" size="2xl">
          Migration details
        </Title>
      </PageSection>
      {isPausedCondition && (
        <PageSection>
          <Alert variant="warning" isInline title="Migration may be stuck.">
            {migration?.tableStatus.warnings.map((warning, idx) => {
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
      {isWarningCondition && (
        <PageSection>
          <Alert
            variant="warning"
            isInline
            title="This migration has following warning conditions:"
          >
            {migration?.tableStatus.warnings.map((warning, idx) => {
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
            {migration?.tableStatus.errors.map((error) => {
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
      {migration && migration.status?.pipeline ? (
        <PageSection>
          <Card>
            <CardBody>
              <MigrationDetailsTable migration={migration} id="migration-details-table" />
            </CardBody>
          </Card>
        </PageSection>
      ) : migration?.tableStatus?.isCanceled ||
        migration?.tableStatus?.isFailed ||
        migration?.tableStatus?.isSucceeded ||
        migration?.tableStatus?.isSucceededWithWarnings ? (
        <PageSection>
          <Card>
            <CardBody>
              This migration is completed but progress information is not available.
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
