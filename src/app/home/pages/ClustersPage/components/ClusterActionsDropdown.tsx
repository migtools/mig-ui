import React, { useState, useContext } from 'react';
import {
  Tooltip,
  Dropdown,
  KebabToggle,
  DropdownItem,
  DropdownPosition,
} from '@patternfly/react-core';
import AddEditClusterModal from './AddEditClusterModal';
import ConfirmModal from '../../../../common/components/ConfirmModal';
import { useOpenModal } from '../../../duck';
import { ClusterContext } from '../../../duck/context';
import { IClusterInfo } from '../helpers';
import { ICluster } from '../../../../cluster/duck/types';

interface IClusterActionsDropdownProps {
  cluster: ICluster;
  clusterInfo: IClusterInfo;
  removeCluster: (clusterName: string) => void;
  setCurrentCluster: (currentCluster: ICluster) => void;
}

const ClusterActionsDropdown: React.FunctionComponent<IClusterActionsDropdownProps> = ({
  clusterInfo,
  removeCluster,
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
    exposedRegistryPath,
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
  let tooltipText;
  if (isHostCluster) {
    tooltipText = <div>The host cluster cannot be removed.</div>;
  } else if (associatedPlanCount > 0) {
    tooltipText = <div>Cluster is associated with a plan and cannot be removed.</div>;
  }
  const removeItem = (
    <DropdownItem
      isDisabled={isHostCluster || associatedPlanCount > 0}
      onClick={() => {
        setKebabIsOpen(false);
        toggleConfirmOpen();
      }}
      key="removeToken"
    >
      Remove
    </DropdownItem>
  );

  return (
    <>
      <Dropdown
        aria-label="Actions"
        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
        isOpen={kebabIsOpen}
        isPlain
        dropdownItems={[
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
          isHostCluster || associatedPlanCount > 0 ? (
            <Tooltip position="top" content={tooltipText} key="removeTokenTooltip">
              {removeItem}
            </Tooltip>
          ) : (
            removeItem
          ),
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
          exposedRegistryPath,
        }}
      />
      <ConfirmModal
        title="Remove this cluster?"
        message={`Removing "${clusterName}" will make it unavailable for migration plans`}
        isOpen={isConfirmOpen}
        onHandleClose={handleRemoveCluster}
        id="confirm-cluster-removal"
      />
    </>
  );
};

export default ClusterActionsDropdown;
