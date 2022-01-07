import { DropdownGroup, DropdownItem } from '@patternfly/react-core';
import React from 'react';
import { IPlan } from '../../../../../plan/duck/types';
import { useOpenModal } from '../../../../duck';
import MigrateModal from './MigrateModal';
import RollbackModal from './RollbackModal';
import StageModal from './StageModal';

interface IMigrationsDropdownGroupProps {
  plan: IPlan;
  setKebabIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// TODO need to eliminate runStateMigrationRequest, RUN_STATE_MIGRATION_REQUEST and related saga?

export const MigrationsDropdownGroup: React.FunctionComponent<IMigrationsDropdownGroupProps> = ({
  plan,
  setKebabIsOpen,
}: IMigrationsDropdownGroupProps) => {
  const [isStageModalOpen, toggleStageModalOpen] = useOpenModal(false);
  const [isMigrateModalOpen, toggleMigrateModalOpen] = useOpenModal(false);
  const [isRollbackModalOpen, toggleRollbackModalOpen] = useOpenModal(false);

  const {
    hasClosedCondition = null,
    hasReadyCondition = null,
    hasErrorCondition = null,
    hasAttemptedMigration = null,
    hasRunningMigrations = null,
    finalMigrationComplete = null,
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
    </DropdownGroup>
  );
};
