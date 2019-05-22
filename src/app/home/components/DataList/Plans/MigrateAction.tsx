import React from 'react';
import { DropdownItem } from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import MigrateModal from '../../../../plan/components/MigrateModal';

const MigrateAction = ({ plan, isLoading, ...props }) => {
  const [isModalOpen, toggleModalOpen] = useOpenModal(false);
  return (
    <DropdownItem
      key="modalOpen"
      //@ts-ignore
      component="button"
      onClick={toggleModalOpen}
      isDisabled={isLoading}
    >
      Migrate
    </DropdownItem>
  );
};

export default MigrateAction;
