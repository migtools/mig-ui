import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  useParams,
  useRouteMatch,
  Link,
  Switch,
  Route,
  useHistory,
  Redirect,
} from 'react-router-dom';
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
  DropdownMenuItem,
  DropdownItemProps,
  DropdownGroup,
  Tooltip,
  PopoverPosition,
} from '@patternfly/react-core';
import { IPlan } from '../../../../../plan/duck/types';
import { PlanActions, planSelectors } from '../../../../../plan/duck';
import MigrationsTable from '../../components/MigrationsTable';
import { MigrationStepDetailsPage } from '../MigrationStepDetailsPage';
import { MigrationDetailsPage } from '../MigrationDetailsPage';
import { PlanDebugPage } from '../../../PlanDebugPage/PlanDebugPage';
import { useOpenModal } from '../../../../duck';
import AccessLogsModal from '../../components/AccessLogsModal';
import { DefaultRootState } from '../../../../../../configureStore';
import MigrateModal from '../../components/PlanActions/MigrateModal';
import RollbackModal from '../../components/PlanActions/RollbackModal';
import StageModal from '../../components/PlanActions/StageModal';
import { clusterPodFetchRequest } from '../../../../../logs/duck/slice';
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

  const [isMigrateModalOpen, toggleMigrateModalOpen] = useOpenModal(false);
  const [isStageModalOpen, toggleStageModalOpen] = useOpenModal(false);
  const [isRollbackModalOpen, toggleRollbackModalOpen] = useOpenModal(false);
  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [accessLogsModalIsOpen, setAccessLogsModalIsOpen] = useOpenModal(false);

  const planStatus = plan?.PlanStatus;
  let kebabDropdownItems: Array<any> = [];
  if (planStatus) {
    const {
      hasClosedCondition = null,
      hasReadyCondition = null,
      hasErrorCondition = null,
      hasRunningMigrations = null,
      finalMigrationComplete = null,
      isPlanLocked = null,
      hasCopyPVs = null,
    } = planStatus;

    const migrationType =
      plan?.MigPlan?.metadata?.annotations['migration.openshift.io/selected-migplan-type'];

    const stateItem = (
      <DropdownItem
        onClick={() => {
          setKebabIsOpen(false);
          dispatch(PlanActions.runStateMigrationRequest(plan, false));
        }}
        key="stateMigration"
        isDisabled={
          hasClosedCondition ||
          !hasReadyCondition ||
          hasErrorCondition ||
          hasRunningMigrations ||
          finalMigrationComplete ||
          isPlanLocked ||
          !hasCopyPVs ||
          migrationType !== 'state'
        }
      >
        State
      </DropdownItem>
    );

    const sccItem = (
      <DropdownItem
        onClick={() => {
          setKebabIsOpen(false);
          dispatch(PlanActions.runStateMigrationRequest(plan, true));
        }}
        key="sccConversion"
        isDisabled={
          hasClosedCondition ||
          !hasReadyCondition ||
          hasErrorCondition ||
          hasRunningMigrations ||
          finalMigrationComplete ||
          isPlanLocked ||
          !hasCopyPVs ||
          migrationType !== 'scc'
        }
      >
        Storage class conversion
      </DropdownItem>
    );

    kebabDropdownItems = [
      <DropdownGroup label="Migrations" key="migrations">
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
          Cutover
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            setKebabIsOpen(false);
            toggleStageModalOpen();
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
        </DropdownItem>
        {!hasCopyPVs ? (
          <Tooltip
            position={PopoverPosition.bottom}
            content={<div>Only plans with PVs selected for Copy can be state migrated.</div>}
            aria-label="disabled state details"
            maxWidth="30rem"
          >
            {stateItem}
          </Tooltip>
        ) : (
          stateItem
        )}
        {sccItem}
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
        </DropdownItem>
      </DropdownGroup>,
    ];
  } else {
    kebabDropdownItems = [];
  }
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

                  <StageModal
                    plan={plan}
                    isOpen={isStageModalOpen}
                    onHandleClose={toggleStageModalOpen}
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
