import React from 'react';
import { DropdownGroup, DropdownItem } from '@patternfly/react-core';
import { IPlan } from '../../../../../plan/duck/types';
import { MigrationConfirmModalState } from './MigrationConfirmModals';

interface IMigrationActionsDropdownGroupProps {
  plan: IPlan;
  setKebabIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalState: MigrationConfirmModalState;
}

export const MigrationActionsDropdownGroup: React.FunctionComponent<IMigrationActionsDropdownGroupProps> =
  ({
    plan,
    setKebabIsOpen,
    modalState: { toggleStageModalOpen, toggleMigrateModalOpen, toggleRollbackModalOpen },
  }: IMigrationActionsDropdownGroupProps) => {
    const {
      hasClosedCondition = null,
      hasReadyCondition = null,
      hasErrorCondition = null,
      hasAttemptedMigration = null,
      hasRunningMigrations = null,
      hasSucceededCutover = null,
      isPlanLocked = null,
    } = plan?.PlanStatus;

    return (
      <DropdownGroup label="Migrations" key="migrations">
        <DropdownItem
          key="stagePlan"
          onClick={() => {
            setKebabIsOpen(false);
            toggleStageModalOpen();
          }}
          isDisabled={
            hasClosedCondition ||
            !hasReadyCondition ||
            hasErrorCondition ||
            hasRunningMigrations ||
            hasSucceededCutover ||
            isPlanLocked
          }
        >
          Stage
        </DropdownItem>
        <DropdownItem
          key="migratePlan"
          onClick={() => {
            setKebabIsOpen(false);
            toggleMigrateModalOpen();
          }}
          isDisabled={
            hasClosedCondition ||
            !hasReadyCondition ||
            hasErrorCondition ||
            hasRunningMigrations ||
            hasSucceededCutover ||
            isPlanLocked
          }
        >
          Cutover
        </DropdownItem>
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
      </DropdownGroup>
    );
  };
