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
import { useDispatch } from 'react-redux';
import { PlanActions } from '../../../../../plan/duck';
import MigrateModal from './MigrateModal';
import RollbackModal from './RollbackModal';
import StageModal from './StageModal';
import ConditionalTooltip from '../Wizard/ConditionalTooltip';
interface IPlanActionsProps {
  plan: IPlan;
}
export const PlanActionsComponent: React.FunctionComponent<IPlanActionsProps> = (props) => {
  const { plan } = props;
  const [isStageModalOpen, toggleStageModalOpen] = useOpenModal(false);
  const [isDeleteModalOpen, toggleDeleteModalOpen] = useOpenModal(false);
  const [isEditWizardOpen, toggleEditWizardOpen] = useOpenModal(false);

  const [isMigrateModalOpen, toggleMigrateModalOpen] = useOpenModal(false);
  const [isRollbackModalOpen, toggleRollbackModalOpen] = useOpenModal(false);
  const dispatch = useDispatch();

  const history = useHistory();

  const {
    hasClosedCondition = null,
    hasReadyCondition = null,
    hasErrorCondition = null,
    hasAttemptedMigration = null,
    hasRunningMigrations = null,
    finalMigrationComplete = null,
    isPlanLocked = null,
    hasCopyPVs = null,
  } = plan?.PlanStatus;
  const migrationType =
    plan?.MigPlan?.metadata?.annotations['migration.openshift.io/selected-migplan-type'];
  const isIntraClusterPlan =
    plan.MigPlan.spec.destMigClusterRef.name === plan.MigPlan.spec.srcMigClusterRef.name;

  const editPlan = () => {
    toggleEditWizardOpen();
  };

  const stageItem = (
    <ConditionalTooltip
      position={PopoverPosition.bottom}
      key="stagePlan"
      content={
        <div>
          Stage is not supported for intra-cluster migrations. Please use the State migration
          option.
        </div>
      }
      aria-label="disabled state details"
      maxWidth="30rem"
      isTooltipEnabled={isIntraClusterPlan}
    >
      <DropdownItem
        onClick={() => {
          setKebabIsOpen(false);
          toggleStageModalOpen();
        }}
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
    </ConditionalTooltip>
  );

  const cutoverItem = (
    <ConditionalTooltip
      position={PopoverPosition.bottom}
      key="migratePlan"
      content={
        <div>
          Cutover is not supported for intra-cluster migrations. Please use the State migration
          option.
        </div>
      }
      aria-label="disabled state details"
      maxWidth="30rem"
      isTooltipEnabled={isIntraClusterPlan}
    >
      <DropdownItem
        onClick={() => {
          setKebabIsOpen(false);
          toggleMigrateModalOpen();
        }}
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
    </ConditionalTooltip>
  );

  const stateItem = (
    <ConditionalTooltip
      isTooltipEnabled={!hasCopyPVs}
      position={PopoverPosition.bottom}
      content={<div>Only plans with PVs selected for Copy can be state migrated.</div>}
      aria-label="disabled state details"
      maxWidth="30rem"
      key="stateMigration"
    >
      <DropdownItem
        onClick={() => {
          setKebabIsOpen(false);
          dispatch(PlanActions.runStateMigrationRequest(plan, false));
        }}
        isDisabled={
          hasClosedCondition ||
          !hasReadyCondition ||
          hasErrorCondition ||
          hasRunningMigrations ||
          finalMigrationComplete ||
          isPlanLocked ||
          !hasCopyPVs
        }
      >
        Start
      </DropdownItem>
    </ConditionalTooltip>
  );

  const sccItem = (
    <DropdownItem
      onClick={() => {
        setKebabIsOpen(false);
        dispatch(PlanActions.runStateMigrationRequest(plan, true));
      }}
      key="scc"
      isDisabled={
        hasClosedCondition ||
        !hasReadyCondition ||
        hasErrorCondition ||
        hasRunningMigrations ||
        finalMigrationComplete ||
        isPlanLocked ||
        !hasCopyPVs
      }
    >
      Start
    </DropdownItem>
  );

  const rollbackItem = (
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
        isPlanLocked ||
        !hasAttemptedMigration
      }
    >
      Rollback
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
      {migrationType === 'full' ? (
        <>
          {stageItem}
          {cutoverItem}
        </>
      ) : migrationType === 'state' ? (
        stateItem
      ) : migrationType === 'scc' ? (
        sccItem
      ) : null}
      {rollbackItem}
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
          isOpen={isEditWizardOpen}
          onHandleWizardModalClose={toggleEditWizardOpen}
          editPlanObj={plan.MigPlan}
          isEdit={true}
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
