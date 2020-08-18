import React, { useState, useContext } from 'react';
import {
  Tooltip,
  Dropdown,
  KebabToggle,
  DropdownItem,
  DropdownPosition,
} from '@patternfly/react-core';
import { IStorageInfo } from '../helpers';
import { useOpenModal } from '../../../duck';
import { StorageContext } from '../../../duck/context';
import ConfirmModal from '../../../../common/components/ConfirmModal';

interface IStorageActionsDropdownProps {
  storageInfo: IStorageInfo;
  removeStorage: (storageName: string) => void;
  toggleAddEditModal: () => void;
}

const StorageActionsDropdown: React.FunctionComponent<IStorageActionsDropdownProps> = ({
  storageInfo,
  removeStorage,
  toggleAddEditModal,
}: IStorageActionsDropdownProps) => {
  const { storageName, associatedPlanCount } = storageInfo;

  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [isConfirmOpen, toggleConfirmOpen] = useOpenModal(false);

  const handleRemoveStorage = (isConfirmed) => {
    if (isConfirmed) {
      removeStorage(storageName);
      toggleConfirmOpen();
    } else {
      toggleConfirmOpen();
    }
  };

  const storageContext = useContext(StorageContext);

  const editStorage = () => {
    storageContext.watchStorageAddEditStatus(storageName);
    storageContext.setCurrentStorage(storageName);
    toggleAddEditModal();
  };

  const removeItem = (
    <DropdownItem
      onClick={() => {
        setKebabIsOpen(false);
        toggleConfirmOpen();
      }}
      isDisabled={associatedPlanCount > 0}
      key="removeStorage"
    >
      Remove
    </DropdownItem>
  );

  return (
    <>
      <Dropdown
        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
        isOpen={kebabIsOpen}
        isPlain
        dropdownItems={[
          <DropdownItem
            onClick={() => {
              setKebabIsOpen(false);
              editStorage();
            }}
            key="editStorage"
          >
            Edit
          </DropdownItem>,
          associatedPlanCount > 0 ? (
            <Tooltip
              position="top"
              content={<div>Repo is associated with a plan and cannot be removed.</div>}
              key="removeRepoTooltip"
            >
              {removeItem}
            </Tooltip>
          ) : (
            removeItem
          ),
        ]}
        position={DropdownPosition.right}
      />
      {isConfirmOpen && (
        <ConfirmModal
          title="Remove this replication repository?"
          message={`Removing "${storageName}" will make it unavailable for migration plans`}
          isOpen={isConfirmOpen}
          onHandleClose={handleRemoveStorage}
          id="confirm-storage-removal"
        />
      )}
    </>
  );
};

export default StorageActionsDropdown;
