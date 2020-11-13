import React, { useContext, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  PageSection,
  Title,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
} from '@patternfly/react-core';
import { IReduxState } from '../../../../../../reducers';
import { IMigration, IPlan } from '../../../../../plan/duck/types';
import { PlanActions, planSelectors } from '../../../../../plan/duck';
import MigrationDetailsTable from './MigrationDetailsTable';

interface IMigrationDetailsPageProps {
  planList: IPlan[];
}

const BaseMigrationDetailsPage: React.FunctionComponent<IMigrationDetailsPageProps> = ({
  planList,
}: IMigrationDetailsPageProps) => {
  const { planName, migrationID } = useParams();

  const migration = planList
    .find((planItem: IPlan) => planItem.MigPlan.metadata.name === planName)
    ?.Migrations.find((migration: IMigration) => migration.metadata.name === migrationID);

  const history = useHistory();
  if (!migration) {
    history.push('/');
    return null;
  }
  const type = migration.spec.stage ? 'Stage' : 'Migration';
  if (!migration.status.pipeline) {
    return null;
  } else {
    return (
      <>
        <PageSection variant="light">
          <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
            <BreadcrumbItem>
              <Link to="/plans">Plans</Link>
            </BreadcrumbItem>
            <BreadcrumbItem to={`/plans/${planName}`}>{planName} Migrations</BreadcrumbItem>
            <BreadcrumbItem to="#" isActive>
              {type} - {migration.status.startTimestamp}
            </BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h1" size="2xl">
            Migration Details page
          </Title>
        </PageSection>
        <PageSection>
          <Card>
            <CardBody>
              <MigrationDetailsTable migration={migration} id="migration-details-table" />
            </CardBody>
          </Card>
        </PageSection>
      </>
    );
  }
};

export const MigrationDetailsPage = connect(
  (state: IReduxState) => ({
    isRefreshingAnalytic: state.plan.isRefreshingAnalytic,
    planList: planSelectors.getPlansWithStatus(state),
  }),
  (dispatch) => ({
    refreshAnalyticRequest: (analyticName: string) =>
      dispatch(PlanActions.refreshAnalyticRequest(analyticName)),
  })
)(BaseMigrationDetailsPage);
