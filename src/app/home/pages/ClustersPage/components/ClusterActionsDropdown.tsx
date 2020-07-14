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
}

const ClusterActionsDropdown: React.FunctionComponent<IClusterActionsDropdownProps> = ({
  cluster,
  clusterInfo,
  removeCluster,
  isAdmin,
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
  const [isAddEditTokenModalOpen, toggleAddEditTokenModal] = useOpenModal(false);
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

  const editCluster = () => {
    clusterContext.watchClusterAddEditStatus(clusterName);
    toggleIsAddEditOpen();
  };

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
                    editCluster();
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
        cluster={cluster}
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
      {isAddEditTokenModalOpen && (
        <AddEditTokenModal onClose={toggleAddEditTokenModal} preSelectedClusterName={clusterName} />
      )}
    </>
  );
};

export default ClusterActionsDropdown;
