import React, { useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { connect } from 'react-redux';
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

import { PollingContext } from '../../../../duck/context';
import { IReduxState } from '../../../../../../reducers';
import { IStep, IMigration, IPlan } from '../../../../../plan/duck/types';
import { PlanActions, planSelectors } from '../../../../../plan/duck';
import MigrationStepDetailsTable from './MigrationStepDetailsTable';

interface IMigrationStepDetailsPageProps {
  planList: IPlan[];
  isFetchingInitialPlans: boolean;
}

const BaseMigrationStepDetailsPage: React.FunctionComponent<IMigrationStepDetailsPageProps> = ({
  planList,
  isFetchingInitialPlans,
}: IMigrationStepDetailsPageProps) => {
  const pollingContext = useContext(PollingContext);
  useEffect(() => {
    pollingContext.startAllDefaultPolling();
  }, []);

  const { planName, migrationID, stepName } = useParams();

  const migration = planList
    .find((planItem: IPlan) => planItem.MigPlan.metadata.name === planName)
    ?.Migrations.find((migration: IMigration) => migration.metadata.name === migrationID);

  const step = migration?.status?.pipeline.find((step: IStep) => step.name === stepName);

  const migrationType = migration?.spec?.stage ? 'Stage' : 'Final';

  return (
    <>
      <PageSection variant="light">
        <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
          <BreadcrumbItem>
            <Link to="/plans">Plans</Link>
          </BreadcrumbItem>
          <BreadcrumbItem to={`/plans/${planName}/migrations`}>
            {planName} Migrations
          </BreadcrumbItem>
          {!isFetchingInitialPlans && migration && (
            <BreadcrumbItem to={`/plans/${planName}/migrations/${migration.metadata.name}`}>
              {migrationType} Steps
            </BreadcrumbItem>
          )}
          {!isFetchingInitialPlans && step && (
            <BreadcrumbItem to="#" isActive>
              {step.name} - {step.started}
            </BreadcrumbItem>
          )}
        </Breadcrumb>
        <Title headingLevel="h1" size="2xl">
          Step Details page
        </Title>
      </PageSection>
      {!isFetchingInitialPlans && step && migration && (
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
      {isFetchingInitialPlans && (
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

export const MigrationStepDetailsPage = connect(
  (state: IReduxState) => ({
    planList: planSelectors.getPlansWithStatus(state),
    isFetchingInitialPlans: state.plan.isFetchingInitialPlans,
  }),
  (dispatch) => ({
    refreshAnalyticRequest: (analyticName: string) =>
      dispatch(PlanActions.refreshAnalyticRequest(analyticName)),
  })
)(BaseMigrationStepDetailsPage);
