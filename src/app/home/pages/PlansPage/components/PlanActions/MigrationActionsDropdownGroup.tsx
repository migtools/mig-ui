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
      finalMigrationComplete = null,
      isPlanLocked = null,
    } = plan?.PlanStatus;

    console.log({
      hasClosedCondition,
      hasReadyCondition,
      hasErrorCondition,
      hasRunningMigrations,
      finalMigrationComplete,
      isPlanLocked,
    });

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
            finalMigrationComplete ||
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
            finalMigrationComplete ||
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
