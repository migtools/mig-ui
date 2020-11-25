import React from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { IPlan } from '../../../../../plan/duck/types';
import { PlanActions, planSelectors } from '../../../../../plan/duck';
import MigrationsTable from '../../components/MigrationsTable';

interface IMigrationsPageProps {
  planList: IPlan[];
  migrationCancelRequest: (name: string) => void;
}

const BaseMigrationsPage: React.FunctionComponent<IMigrationsPageProps> = ({
  planList,
  migrationCancelRequest,
}: IMigrationsPageProps) => {
  const { planName } = useParams();
  const plan = planList.find((planItem: IPlan) => planItem.MigPlan.metadata.name === planName);

  return (
    <>
      <PageSection variant="light">
        <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
          <BreadcrumbItem>
            <Link to="/plans">Plans</Link>
          </BreadcrumbItem>
          <BreadcrumbItem to="#" isActive>
            {planName}
          </BreadcrumbItem>
        </Breadcrumb>
        <Title headingLevel="h1" size="2xl">
          Migrations
        </Title>
      </PageSection>
      {!plan ? null : (
        <PageSection>
          <Card>
            <CardBody>
              <MigrationsTable
                type="Migrations"
                planName={planName}
                migrations={plan.Migrations}
                isPlanLocked={plan.PlanStatus.isPlanLocked}
                id="migrations-history-expansion-table"
                handleMigrationCancelRequest={migrationCancelRequest}
              />
            </CardBody>
          </Card>
        </PageSection>
      )}
    </>
  );
};

const mapStateToProps = (state: IReduxState) => ({
  planList: planSelectors.getPlansWithStatus(state),
});

const mapDispatchToProps = (dispatch) => ({
  migrationCancelRequest: (migrationName: string) =>
    dispatch(PlanActions.migrationCancelRequest(migrationName)),
});

export const MigrationsPage = connect(mapStateToProps, mapDispatchToProps)(BaseMigrationsPage);
// export const MigrationsPage = connect((state: IReduxState) => ({
//   planList: planSelectors.getPlansWithStatus(state),
// }))(BaseMigrationsPage);
