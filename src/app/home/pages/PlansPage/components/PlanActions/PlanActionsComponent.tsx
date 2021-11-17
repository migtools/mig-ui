import React from 'react';
import { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
  Flex,
  FlexItem,
  DropdownGroup,
  Popover,
  PopoverPosition,
  Tooltip,
} from '@patternfly/react-core';
import { useOpenModal } from '../../../../duck';
import { useHistory } from 'react-router-dom';
import WizardContainer from '../Wizard/WizardContainer';
import ConfirmModal from '../../../../../common/components/ConfirmModal';
import { IPlan } from '../../../../../plan/duck/types';
import { useSelector, useDispatch } from 'react-redux';
import { planSelectors, PlanActions } from '../../../../../plan/duck';
import { clusterSelectors } from '../../../../../cluster/duck';
import { storageSelectors } from '../../../../../storage/duck';
import { DefaultRootState } from '../../../../../../configureStore';
import StateMigrationModal from './StateMigrationModal';
import MigrateModal from './MigrateModal';
import RollbackModal from './RollbackModal';
import StageModal from './StageModal';
interface IPlanActionsProps {
  plan: IPlan;
}
export const PlanActionsComponent: React.FunctionComponent<IPlanActionsProps> = (props) => {
  const { plan } = props;
  // const [isStateMigrationModalOpen, toggleStateMigrationModalOpen] = useOpenModal(false);
  const [isStageModalOpen, toggleStageModalOpen] = useOpenModal(false);
  const [isDeleteModalOpen, toggleDeleteModalOpen] = useOpenModal(false);
  const [isEditWizardOpen, toggleEditWizardOpen] = useOpenModal(false);

  const planList = useSelector((state: DefaultRootState) =>
    planSelectors.getPlansWithStatus(state)
  );
  const clusterList = useSelector((state: DefaultRootState) =>
    clusterSelectors.getAllClusters(state)
  );
  const storageList = useSelector((state: DefaultRootState) =>
    storageSelectors.getAllStorage(state)
  );
  const [isMigrateModalOpen, toggleMigrateModalOpen] = useOpenModal(false);
  const [isRollbackModalOpen, toggleRollbackModalOpen] = useOpenModal(false);
  const dispatch = useDispatch();

  const history = useHistory();

  const {
    hasClosedCondition = null,
    hasReadyCondition = null,
    hasErrorCondition = null,
    hasRunningMigrations = null,
    finalMigrationComplete = null,
    isPlanLocked = null,
    hasCopyPVs = null,
  } = plan?.PlanStatus;
  const isIntraClusterPlan =
    plan.MigPlan.spec.destMigClusterRef.name === plan.MigPlan.spec.srcMigClusterRef.name;
  const migrationType =
    'full' || plan?.MigPlan?.metadata?.annotations['migration.openshift.io/selected-migplan-type'];

  const editPlan = () => {
    toggleEditWizardOpen();
  };
  const stateItem = (
    <DropdownItem
      onClick={() => {
        setKebabIsOpen(false);
        dispatch(PlanActions.runStateMigrationRequest(plan));
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
  const stageItem = (
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
        isPlanLocked ||
        isIntraClusterPlan
      }
    >
      Stage
    </DropdownItem>
  );
  const cutoverItem = (
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
        isPlanLocked ||
        isIntraClusterPlan
      }
    >
      Cutover
    </DropdownItem>
  );

  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const kebabDropdownItems = [
    <DropdownGroup>
      <DropdownItem
        key="showLogs"
        onClick={() => {
          setKebabIsOpen(false);
          history.push('/logs/' + plan.MigPlan.metadata.name);
        }}
      >
        Logs
      </DropdownItem>
      <DropdownItem
        isDisabled={
          hasClosedCondition || hasRunningMigrations || finalMigrationComplete || isPlanLocked
        }
        onClick={() => {
          setKebabIsOpen(false);
          editPlan();
        }}
        key="editPlan"
      >
        Edit
      </DropdownItem>
      <DropdownItem
        onClick={() => {
          setKebabIsOpen(false);
          toggleDeleteModalOpen();
        }}
        key="deletePlan"
        isDisabled={hasRunningMigrations || isPlanLocked}
      >
        Delete
      </DropdownItem>
    </DropdownGroup>,
    <DropdownGroup label="Migrations" key="migrations">
      {isIntraClusterPlan ? (
        <Tooltip
          position={PopoverPosition.bottom}
          content={
            <div>
              Stage is not supported for intra-cluster migrations. Please use the State migration
              option.
            </div>
          }
          aria-label="disabled state details"
          maxWidth="30rem"
        >
          {stageItem}
        </Tooltip>
      ) : (
        stageItem
      )}
      {isIntraClusterPlan ? (
        <Tooltip
          position={PopoverPosition.bottom}
          content={
            <div>
              Cutover is not supported for intra-cluster migrations. Please use the State migration
              option.
            </div>
          }
          aria-label="disabled state details"
          maxWidth="30rem"
        >
          {cutoverItem}
        </Tooltip>
      ) : (
        cutoverItem
      )}

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
  return (
    <Flex>
      <FlexItem>
        <Dropdown
          toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
          isOpen={kebabIsOpen}
          isPlain
          dropdownItems={kebabDropdownItems}
          position={DropdownPosition.right}
          isGrouped
        />
        <WizardContainer
          planList={planList}
          clusterList={clusterList}
          storageList={storageList}
          isOpen={isEditWizardOpen}
          onHandleWizardModalClose={toggleEditWizardOpen}
          editPlanObj={plan.MigPlan}
          isEdit={true}
          {...props}
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

        <StageModal plan={plan} isOpen={isStageModalOpen} onHandleClose={toggleStageModalOpen} />

        <ConfirmModal
          title="Confirmation"
          message={`Do you really want to delete migration plan "${plan.MigPlan.metadata.name}"?`}
          isOpen={isDeleteModalOpen}
          onHandleClose={(isConfirmed) => {
            if (isConfirmed) {
              dispatch(PlanActions.planCloseAndDeleteRequest(plan.MigPlan.metadata.name));
            }
            toggleDeleteModalOpen();
          }}
          id="confirm-plan-removal"
        />
      </FlexItem>
    </Flex>
  );
};
