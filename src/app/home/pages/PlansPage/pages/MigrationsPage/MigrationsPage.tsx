import React, { useState } from 'react';
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
  DropdownItem,
} from '@patternfly/react-core';
import { IPlan } from '../../../../../plan/duck/types';
import { PlanActions, planSelectors } from '../../../../../plan/duck';
import MigrationsTable from '../../components/MigrationsTable';
import { MigrationStepDetailsPage } from '../MigrationStepDetailsPage';
import { MigrationDetailsPage } from '../MigrationDetailsPage';
import { PlanDebugPage } from '../../../PlanDebugPage/PlanDebugPage';
import { useOpenModal } from '../../../../duck';
import { access } from 'fs';
import AccessLogsModal from '../../components/AccessLogsModal';
import { DefaultRootState } from '../../../../../../configureStore';
import MigrateModal from '../../components/PlanActions/MigrateModal';
import RollbackModal from '../../components/PlanActions/RollbackModal';
const styles = require('./MigrationsPage.module').default;

interface IMigrationsPageParams {
  planName: string;
}
export const MigrationsPage: React.FunctionComponent = () => {
  const dispatch = useDispatch();
  const { planName } = useParams<IMigrationsPageParams>();
  const planList: IPlan[] = useSelector((state: DefaultRootState) =>
    planSelectors.getPlansWithStatus(state)
  );
  const plan: IPlan = planList.find(
    (planItem: IPlan) => planItem.MigPlan.metadata.name === planName
  );

  const migrations = plan?.Migrations;
  const { path, url } = useRouteMatch();

  const [isMigrateModalOpen, toggleMigrateModalOpen] = useOpenModal(false);
  const [isRollbackModalOpen, toggleRollbackModalOpen] = useOpenModal(false);

  if (!migrations) {
    return <Redirect to="/" />;
  } else {
    const {
      hasClosedCondition,
      hasReadyCondition,
      hasErrorCondition,
      hasRunningMigrations,
      finalMigrationComplete,
      isPlanLocked,
    } = plan?.PlanStatus;
    const [kebabIsOpen, setKebabIsOpen] = useState(false);
    const [accessLogsModalIsOpen, setAccessLogsModalIsOpen] = useOpenModal(false);
    const kebabDropdownItems = [
      <DropdownItem
        onClick={() => {
          setKebabIsOpen(false);
          dispatch(PlanActions.runStageRequest(plan));
        }}
        key="stagePlan"
        isDisabled={
          hasClosedCondition ||
          !hasReadyCondition ||
          hasErrorCondition ||
          hasRunningMigrations ||
          finalMigrationComplete ||
          isPlanLocked
        }
      >
        Stage
      </DropdownItem>,
      <DropdownItem
        onClick={() => {
          setKebabIsOpen(false);
          toggleMigrateModalOpen();
        }}
        key="migratePlan"
        isDisabled={
          hasClosedCondition ||
          !hasReadyCondition ||
          hasErrorCondition ||
          hasRunningMigrations ||
          finalMigrationComplete ||
          isPlanLocked
        }
      >
        Migrate
      </DropdownItem>,
      <DropdownItem
        onClick={() => {
          setKebabIsOpen(false);
          toggleRollbackModalOpen();
        }}
        key="rollbackPlan"
        isDisabled={
          hasClosedCondition ||
          !hasReadyCondition ||
          hasErrorCondition ||
          hasRunningMigrations ||
          isPlanLocked
        }
      >
        Rollback
      </DropdownItem>,
    ];

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
                      </FlexItem>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <MigrationsTable
                      type="Migrations"
                      planName={planName}
                      migrations={migrations}
                      isPlanLocked={plan.PlanStatus.isPlanLocked}
                      id="migrations-history-expansion-table"
                    />
                    <AccessLogsModal
                      isOpen={accessLogsModalIsOpen}
                      onHandleClose={setAccessLogsModalIsOpen}
                    />
                    <MigrateModal
                      plan={plan}
                      isOpen={isMigrateModalOpen}
                      onHandleClose={toggleMigrateModalOpen}
                    />

                    <RollbackModal
                      plan={plan}
                      isOpen={isRollbackModalOpen}
                      onHandleClose={toggleRollbackModalOpen}
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
            <PlanDebugPage />
          </Route>
        </Switch>
      </>
    );
  }
};
