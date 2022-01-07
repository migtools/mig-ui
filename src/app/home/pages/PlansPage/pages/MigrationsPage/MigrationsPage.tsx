import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useParams, useRouteMatch, Link, Switch, Route, Redirect } from 'react-router-dom';
import {
  PageSection,
  Title,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  CardHeader,
  FlexItem,
  Flex,
  Button,
  Dropdown,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';
import { IPlan } from '../../../../../plan/duck/types';
import { planSelectors } from '../../../../../plan/duck';
import MigrationsTable from '../../components/MigrationsTable';
import { MigrationStepDetailsPage } from '../MigrationStepDetailsPage';
import { MigrationDetailsPage } from '../MigrationDetailsPage';
import { PlanDebugPage } from '../../../PlanDebugPage/PlanDebugPage';
import { useOpenModal } from '../../../../duck';
import AccessLogsModal from '../../components/AccessLogsModal';
import { DefaultRootState } from '../../../../../../configureStore';
import { clusterPodFetchRequest } from '../../../../../logs/duck/slice';
import { MigrationsDropdownGroup } from '../../components/PlanActions/MigrationsDropdownGroup';
import {
  MigrationConfirmModals,
  useMigrationConfirmModalState,
} from '../../components/PlanActions/MigrationConfirmModals';
const styles = require('./MigrationsPage.module').default;

interface IMigrationsPageParams {
  planName: string;
}
export const MigrationsPage: React.FunctionComponent = () => {
  useEffect(() => {
    dispatch(clusterPodFetchRequest(planName));
  }, []);
  const { planName = null } = useParams<IMigrationsPageParams>();
  const planList: IPlan[] = useSelector((state: DefaultRootState) =>
    planSelectors.getPlansWithStatus(state)
  );
  const plan: IPlan = planList.find(
    (planItem: IPlan) => planItem.MigPlan.metadata.name === planName
  );

  const migrations = plan?.Migrations;
  const dispatch = useDispatch();
  const { path, url } = useRouteMatch();

  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [accessLogsModalIsOpen, setAccessLogsModalIsOpen] = useOpenModal(false);

  const migrationModalState = useMigrationConfirmModalState();

  const planStatus = plan?.PlanStatus;
  const kebabDropdownItems = planStatus
    ? [
        <MigrationsDropdownGroup
          plan={plan}
          setKebabIsOpen={setKebabIsOpen}
          modalState={migrationModalState}
        />,
      ]
    : [];

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
          {!plan ? (
            <Redirect to="/" />
          ) : (
            <PageSection>
              <Card>
                <CardHeader>
                  <Flex className={styles.flexStyle}>
                    <FlexItem className={styles.logsButton}>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setAccessLogsModalIsOpen();
                        }}
                        key={`logs-modal-${plan?.MigPlan.metadata.name}`}
                      >
                        View logs
                      </Button>
                    </FlexItem>
                    <FlexItem className={styles.kebabContainer}>
                      <Dropdown
                        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
                        isOpen={kebabIsOpen}
                        isPlain
                        dropdownItems={kebabDropdownItems}
                        position={DropdownPosition.right}
                      />
                      <MigrationConfirmModals plan={plan} modalState={migrationModalState} />
                    </FlexItem>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <MigrationsTable
                    type="Migrations"
                    planName={planName}
                    migrations={migrations}
                    isPlanLocked={plan?.PlanStatus?.isPlanLocked}
                    id="migrations-history-expansion-table"
                  />
                  <AccessLogsModal
                    planName={planName}
                    isOpen={accessLogsModalIsOpen}
                    onHandleClose={setAccessLogsModalIsOpen}
                  />
                </CardBody>
              </Card>
            </PageSection>
          )}
        </Route>

        <Route exact path={`${path}/:migrationID`}>
          {!plan ? (
            <Redirect to="/" />
          ) : (
            <>
              <MigrationDetailsPage />
              <PlanDebugPage />
            </>
          )}
        </Route>
        <Route exact path={`${path}/:migrationID/:stepName`}>
          {!plan ? (
            <Redirect to="/" />
          ) : (
            <>
              <MigrationStepDetailsPage />
              <PlanDebugPage />
            </>
          )}
        </Route>
      </Switch>
    </>
  );
};
