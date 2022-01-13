import React, { useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  PageSection,
  Title,
  EmptyState,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Bullseye,
  Spinner,
  CardBody,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { IStep, IMigration, IPlan } from '../../../../../plan/duck/types';
import { planSelectors } from '../../../../../plan/duck';
import MigrationStepDetailsTable from './MigrationStepDetailsTable';
import {
  getStepPageTitle,
  formatGolangTimestamp,
  migSpecToAction,
  migrationActionToString,
  getPlanInfo,
} from '../../helpers';
import { DefaultRootState } from '../../../../../../configureStore';

interface IMigrationStepDetailsPageParams {
  planName: string;
  migrationID: string;
  stepName: string;
}

export const MigrationStepDetailsPage: React.FunctionComponent = () => {
  const { planName, migrationID, stepName } = useParams<IMigrationStepDetailsPageParams>();
  const planList: IPlan[] = useSelector((state: DefaultRootState) =>
    planSelectors.getPlansWithStatus(state)
  );

  const plan = planList.find((planItem: IPlan) => planItem.MigPlan.metadata.name === planName);
  const migration = plan?.Migrations.find((migration) => migration.metadata.name === migrationID);

  const step = migration?.status?.pipeline.find((step: IStep) => step.name === stepName);

  const { migrationType } = getPlanInfo(plan);
  const action = migSpecToAction(migrationType, migration?.spec);

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
            <BreadcrumbItem>
              <Link to={`/plans/${planName}/migrations/${migration.metadata.name}`}>
                {migrationActionToString(action)} -{' '}
                {formatGolangTimestamp(migration.status.startTimestamp)}
              </Link>
            </BreadcrumbItem>
          )}
          {step && (
            <BreadcrumbItem to="#" isActive>
              {step.name}
            </BreadcrumbItem>
          )}
        </Breadcrumb>
        {step && (
          <Title headingLevel="h1" size="2xl">
            {getStepPageTitle(step)}
          </Title>
        )}
      </PageSection>
      {step && migration && (
        <PageSection>
          <Card>
            <CardBody>
              <MigrationStepDetailsTable
                step={step}
                migration={migration}
                id="migration-details-table"
              />
            </CardBody>
          </Card>
        </PageSection>
      )}
      {!migration && (
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
