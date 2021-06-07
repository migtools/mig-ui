import * as React from 'react';
import { useDispatch } from 'react-redux';
import { PlanActions, planSagas } from '../../plan/duck';
import { IPlan } from '../../plan/duck/types';
import { useOpenModal } from '../duck/hooks';
// interface IPlanParams {}
interface IPlanContext {
  toggleMigrateModalOpen: () => void;
  toggleRollbackModalOpen: () => void;
  isMigrateModalOpen: boolean;
  isRollbackModalOpen: boolean;
}

const PlanContext = React.createContext<IPlanContext>({
  toggleMigrateModalOpen: () => undefined,
  toggleRollbackModalOpen: () => undefined,
  isMigrateModalOpen: false,
  isRollbackModalOpen: false,
});

interface IPlanContextProviderProps {
  children: React.ReactNode;
}

export const PlanContextProvider: React.FunctionComponent<IPlanContextProviderProps> = ({
  children,
}: IPlanContextProviderProps) => {
  const [isMigrateModalOpen, toggleMigrateModalOpen] = useOpenModal(false);
  const [isRollbackModalOpen, toggleRollbackModalOpen] = useOpenModal(false);

  return (
    <PlanContext.Provider
      value={{
        toggleMigrateModalOpen: toggleMigrateModalOpen,
        toggleRollbackModalOpen: toggleRollbackModalOpen,
        isMigrateModalOpen,
        isRollbackModalOpen,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlanContext = (): IPlanContext => React.useContext(PlanContext);
