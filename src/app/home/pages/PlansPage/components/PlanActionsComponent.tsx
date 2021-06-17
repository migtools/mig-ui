import React from 'react';
import { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { useOpenModal } from '../../../duck';
import MigrateModal from './MigrateModal';
import RollbackModal from './RollbackModal';
import { useHistory } from 'react-router-dom';
import WizardContainer from './Wizard/WizardContainer';
import ConfirmModal from '../../../../common/components/ConfirmModal';
import { IPlan } from '../../../../plan/duck/types';
import { useSelector, useDispatch } from 'react-redux';
import { planSelectors, PlanActions } from '../../../../plan/duck';
import { clusterSelectors } from '../../../../cluster/duck';
import { storageSelectors } from '../../../../storage/duck';
interface IPlanActionsProps {
  plan: IPlan;
}
export const PlanActionsComponent: React.FunctionComponent<IPlanActionsProps> = ({ plan }) => {
  const [isDeleteModalOpen, toggleDeleteModalOpen] = useOpenModal(false);
  const [isEditWizardOpen, toggleEditWizardOpen] = useOpenModal(false);
  const planList = useSelector((state) => planSelectors.getPlansWithStatus(state));
  const clusterList = useSelector((state) => clusterSelectors.getAllClusters(state));
  const storageList = useSelector((state) => storageSelectors.getAllStorage(state));
  const [isMigrateModalOpen, toggleMigrateModalOpen] = useOpenModal(false);
  const [isRollbackModalOpen, toggleRollbackModalOpen] = useOpenModal(false);
  const dispatch = useDispatch();

  const history = useHistory();

  const {
    hasClosedCondition,
    hasReadyCondition,
    hasErrorCondition,
    hasRunningMigrations,
    finalMigrationComplete,
    isPlanLocked,
  } = plan.PlanStatus;

  const editPlan = () => {
    toggleEditWizardOpen();
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
    <DropdownItem
      key="showLogs"
      onClick={() => {
        setKebabIsOpen(false);
        history.push('/logs/' + plan.MigPlan.metadata.name);
      }}
    >
      Logs
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
          planList={planList}
          clusterList={clusterList}
          storageList={storageList}
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
