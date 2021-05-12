import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useParams, useRouteMatch, Link, Switch, Route, Redirect } from 'react-router-dom';
import {
  PageSection,
  Title,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
} from '@patternfly/react-core';
import { IPlan } from '../../../../../plan/duck/types';
import { planSelectors } from '../../../../../plan/duck';
import MigrationsTable from '../../components/MigrationsTable';
import { MigrationStepDetailsPage } from '../MigrationStepDetailsPage';
import { MigrationDetailsPage } from '../MigrationDetailsPage';
import { clearJSONView, stopDebugPolling } from '../../../../../debug/duck/slice';
import { PlanDebugPage } from '../../../PlanDebugPage/PlanDebugPage';

export const MigrationsPage: React.FunctionComponent = () => {
  const { planName } = useParams();
  const planList = useSelector((state) => planSelectors.getPlansWithStatus(state));
  const plan = planList.find((planItem: IPlan) => planItem.MigPlan.metadata.name === planName);
  const { path, url } = useRouteMatch();
  const dispatch = useDispatch();
  useEffect(() => {
    return () => {
      //cleanup on dismount
      dispatch(stopDebugPolling(planName));
      dispatch(clearJSONView());
    };
  }, []);

  return (
    <>
      <Switch>
        <Route exact path={path}>
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
                  />
                </CardBody>
              </Card>
            </PageSection>
          )}
        </Route>
        <Route exact path={`${path}/:migrationID`}>
          <MigrationDetailsPage />
          <PlanDebugPage />
        </Route>
        <Route exact path={`${path}/:migrationID/:stepName`}>
          <MigrationStepDetailsPage />
        </Route>
      </Switch>
    </>
  );
};
