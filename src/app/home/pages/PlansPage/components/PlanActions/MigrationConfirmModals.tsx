import React from 'react';
import { IPlan } from '../../../../../plan/duck/types';
import { useOpenModal } from '../../../../duck';
import MigrateModal from './MigrateModal';
import RollbackModal from './RollbackModal';
import StageModal from './StageModal';

export const useMigrationConfirmModalState = () => {
  const [isStageModalOpen, toggleStageModalOpen] = useOpenModal(false);
  const [isMigrateModalOpen, toggleMigrateModalOpen] = useOpenModal(false);
  const [isRollbackModalOpen, toggleRollbackModalOpen] = useOpenModal(false);
  return {
    isStageModalOpen,
    toggleStageModalOpen,
    isMigrateModalOpen,
    toggleMigrateModalOpen,
    isRollbackModalOpen,
    toggleRollbackModalOpen,
  };
};

export type MigrationConfirmModalState = ReturnType<typeof useMigrationConfirmModalState>;

interface IMigrationConfirmModalsProps {
  plan: IPlan;
  modalState: MigrationConfirmModalState;
}

export const MigrationConfirmModals: React.FunctionComponent<IMigrationConfirmModalsProps> = ({
  plan,
  modalState: {
    isStageModalOpen,
    toggleStageModalOpen,
    isMigrateModalOpen,
    toggleMigrateModalOpen,
    isRollbackModalOpen,
    toggleRollbackModalOpen,
  },
}: IMigrationConfirmModalsProps) => (
  <>
    <MigrateModal plan={plan} isOpen={isMigrateModalOpen} onHandleClose={toggleMigrateModalOpen} />
    <RollbackModal
      plan={plan}
      isOpen={isRollbackModalOpen}
      onHandleClose={toggleRollbackModalOpen}
    />
    <StageModal plan={plan} isOpen={isStageModalOpen} onHandleClose={toggleStageModalOpen} />
  </>
);
