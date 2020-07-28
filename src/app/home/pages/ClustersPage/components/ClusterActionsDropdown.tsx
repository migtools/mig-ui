import React, { useState, useContext } from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import AddEditClusterModal from './AddEditClusterModal';
import ConfirmModal from '../../../../common/components/ConfirmModal';
import { useOpenModal } from '../../../duck';
import { ClusterContext } from '../../../duck/context';
import { IClusterInfo } from '../helpers';
import { ICluster } from '../../../../cluster/duck/types';
import AddEditTokenModal from '../../../../common/components/AddEditTokenModal';
import { NON_ADMIN_ENABLED } from '../../../../../TEMPORARY_GLOBAL_FLAGS';

interface IClusterActionsDropdownProps {
  cluster: ICluster;
  clusterInfo: IClusterInfo;
  removeCluster: (clusterName: string) => void;
  isAdmin: boolean;
  toggleAddEditTokenModal: () => void;
  isAddEditTokenModalOpen: boolean;
  setAssociatedCluster: (clusterName: string) => void;
  setCurrentCluster: (currentCluster: ICluster) => void;
}

const ClusterActionsDropdown: React.FunctionComponent<IClusterActionsDropdownProps> = ({
  clusterInfo,
  removeCluster,
  isAdmin,
  toggleAddEditTokenModal,
  isAddEditTokenModalOpen,
  setAssociatedCluster,
  cluster,
  setCurrentCluster,
}: IClusterActionsDropdownProps) => {
  const {
    clusterName,
    clusterUrl,
    clusterSvcToken,
    clusterRequireSSL,
    clusterCABundle,
    associatedPlanCount,
    isHostCluster,
    clusterIsAzure,
    clusterAzureResourceGroup,
  } = clusterInfo;

  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [isAddEditOpen, toggleIsAddEditOpen] = useOpenModal(false);
  const [isConfirmOpen, toggleConfirmOpen] = useOpenModal(false);

  const handleRemoveCluster = (isConfirmed) => {
    if (isConfirmed) {
      removeCluster(clusterName);
      toggleConfirmOpen();
    } else {
      toggleConfirmOpen();
    }
  };

  const clusterContext = useContext(ClusterContext);

  return (
    <>
      <Dropdown
        aria-label="Actions"
        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
        isOpen={kebabIsOpen}
        isPlain
        dropdownItems={[
          ...(NON_ADMIN_ENABLED
            ? [
                <DropdownItem
                  onClick={() => {
                    setKebabIsOpen(false);
                    toggleAddEditTokenModal();
                    setAssociatedCluster(clusterName);
                  }}
                  key="addToken"
                >
                  Add token
                </DropdownItem>,
              ]
            : []),
          ...(isAdmin
            ? [
                <DropdownItem
                  onClick={() => {
                    setKebabIsOpen(false);
                    clusterContext.watchClusterAddEditStatus(clusterName);
                    setCurrentCluster(cluster);
                    toggleIsAddEditOpen();
                  }}
                  isDisabled={isHostCluster}
                  key="editCluster"
                >
                  Edit
                </DropdownItem>,
                <DropdownItem
                  onClick={() => {
                    setKebabIsOpen(false);
                    toggleConfirmOpen();
                  }}
                  isDisabled={isHostCluster || associatedPlanCount > 0}
                  key="removeCluster"
                >
                  Remove
                </DropdownItem>,
              ]
            : []),
        ]}
        position={DropdownPosition.right}
      />
      <AddEditClusterModal
        isOpen={isAddEditOpen}
        onHandleClose={toggleIsAddEditOpen}
        initialClusterValues={{
          clusterName,
          clusterUrl,
          clusterSvcToken,
          clusterIsAzure,
          clusterAzureResourceGroup,
          clusterRequireSSL,
          clusterCABundle,
        }}
      />
      <ConfirmModal
        title="Remove this cluster?"
        message={`Removing "${clusterName}" will make it unavailable for migration plans`}
        isOpen={isConfirmOpen}
        onHandleClose={handleRemoveCluster}
        id="confirm-cluster-removal"
      />
      {isAddEditTokenModalOpen && <AddEditTokenModal />}
    </>
  );
};

export default ClusterActionsDropdown;
