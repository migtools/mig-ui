import React from 'react';
import { useState, useContext } from 'react';
import { PlanContext } from '../../../duck/context';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import MigrateModal from '../../../../plan/components/MigrateModal';
import { withRouter } from 'react-router-dom';
import WizardContainer from '../../../../plan/components/Wizard/WizardContainer';
import ConfirmModal from '../../../../common/components/ConfirmModal';

const PlanActions = ({ plan, history }) => {
  const [isMigrateModalOpen, toggleMigrateModalOpen] = useOpenModal(false);
  const [isDeleteModalOpen, toggleDeleteModalOpen] = useOpenModal(false);
  const [isWizardOpen, toggleWizardOpen] = useOpenModal(false);
  const planContext = useContext(PlanContext);
  const {
    hasClosedCondition,
    hasReadyCondition,
    hasErrorCondition,
    hasRunningMigrations,
    hasAttemptedMigration,
    finalMigrationComplete,
    isPlanLocked,
  } = plan.PlanStatus;

  const editPlan = () => {
    toggleWizardOpen();
  };

  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const kebabDropdownItems = [
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
    </DropdownItem>,

    <DropdownItem
      onClick={() => {
        setKebabIsOpen(false);
        planContext.handleStageTriggered(plan);
      }}
      key="stagePlan"
      isDisabled={
        hasClosedCondition ||
        !hasReadyCondition ||
        hasErrorCondition ||
        hasRunningMigrations ||
        hasAttemptedMigration ||
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
        toggleDeleteModalOpen();
      }}
      key="deletePlan"
      isDisabled={hasRunningMigrations || isPlanLocked}
    >
      Delete
    </DropdownItem>,
    <DropdownItem
      key="showLogs"
      onClick={() => {
        setKebabIsOpen(false);
        history.push('/logs/' + plan.MigPlan.metadata.name);
      }}
    >
      Logs
    </DropdownItem>,
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
        />
        <WizardContainer
          planList={planContext.planList}
          clusterList={planContext.clusterList}
          storageList={planContext.storageList}
          isOpen={isWizardOpen}
          onHandleWizardModalClose={toggleWizardOpen}
          editPlanObj={plan.MigPlan}
          isEdit={true}
        />

        <MigrateModal
          plan={plan}
          isOpen={isMigrateModalOpen}
          onHandleClose={toggleMigrateModalOpen}
        />

        <ConfirmModal
          title="Confirmation"
          message={`Do you really want to delete migration plan "${plan.MigPlan.metadata.name}"?`}
          isOpen={isDeleteModalOpen}
          onHandleClose={(isConfirmed) => {
            if (isConfirmed) planContext.handleDeletePlan(plan);
            toggleDeleteModalOpen();
          }}
          id="confirm-plan-removal"
        />
      </FlexItem>
    </Flex>
  );
};

export default withRouter(PlanActions);
