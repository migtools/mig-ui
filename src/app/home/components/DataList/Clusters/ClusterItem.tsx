import React, { useState, useContext } from 'react';
import { Flex, Box } from '@rebass/emotion';
import {
  Button,
  DataListAction,
  DataListItem,
  DataListCell,
  DataListItemCells,
  DataListItemRow,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from '@patternfly/react-core';
import StatusIcon from '../../../../common/components/StatusIcon';
import { useOpenModal } from '../../../duck/hooks';
import AddEditClusterModal from '../../../../cluster/components/AddEditClusterModal';
import ConfirmModal from '../../../../common/components/ConfirmModal';
import { ClusterContext } from '../../../duck/context';

const ClusterItem = ({ cluster, clusterIndex, migMeta, removeCluster, ...props }) => {
  let clusterIsAzure = false;
  const clusterAzureResourceGroup = cluster.MigCluster.spec.azureResourceGroup;
  if (clusterAzureResourceGroup) {
    clusterIsAzure = true;
  }
  const clusterName = cluster.MigCluster.metadata.name;
  let clusterStatus = null;
  if (cluster.MigCluster.status) {
    clusterStatus = cluster.MigCluster.status.conditions.filter(c => c.type === 'Ready').length > 0;
  }
  const clusterUrl = cluster.MigCluster.spec.isHostCluster
    ? migMeta.clusterApi
    : cluster.MigCluster.spec.url;

  const clusterSvcToken =
    !cluster.MigCluster.spec.isHostCluster && cluster.Secret.data.saToken
      ? atob(cluster.Secret.data.saToken)
      : null;

  const associatedPlanCount = props.associatedPlans[clusterName];
  const planText = associatedPlanCount === 1 ? 'plan' : 'plans';

  const [isAddEditOpen, toggleIsAddEditOpen] = useOpenModal(false);
  const [isConfirmOpen, toggleConfirmOpen] = useOpenModal(false);

  const isHostCluster = cluster.MigCluster.spec.isHostCluster;

  const removeMessage = `Are you sure you want to remove "${clusterName}"`;

  const handleRemoveCluster = isConfirmed => {
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

  const [kebabIsOpen, setKebabIsOpen] = useState(false);

  const kebabDropdownItems = [
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
      isDisabled={isHostCluster}
      key="removeCluster"
    >
      Remove
  </DropdownItem>,
  ];

  return (
    <DataListItem key={clusterIndex} aria-labelledby="cluster-item">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="name" width={1}>
              <div className="pf-l-flex">
                <div className="pf-l-flex__item">
                  <span id="cluster-name">{clusterName}</span>
                </div>
              </div>
            </DataListCell>,
            <DataListCell key="url" width={3}>
              <a target="_blank" href={clusterUrl}>
                {clusterUrl}
              </a>
            </DataListCell>,
            <DataListCell key="count" width={2}>
              <div className="pf-l-flex">
                <div className="pf-l-flex__item">
                  {associatedPlanCount} associated migration {planText}
                </div>
              </div>
            </DataListCell>,
            <DataListCell key="connection" width={1}>
              <div className="pf-l-flex">
                <div className="pf-l-flex__item">
                  <StatusIcon isReady={clusterStatus} />
                </div>
                <div className="pf-l-flex__item">
                  <span id="cluster-status-text">{clusterStatus ? `Connected` : `Connection Failed`}</span>
                </div>
              </div>
            </DataListCell>,

          ]}
        />,
        <DataListAction
          aria-labelledby="cluster-item cluster-item-actions-dropdown"
          id="cluster-item-actions-dropdown"
          aria-label="Actions"
        >
          <Dropdown
            toggle={<KebabToggle
              onToggle={() => setKebabIsOpen(!kebabIsOpen)}
            />}
            isOpen={kebabIsOpen}
            isPlain
            dropdownItems={kebabDropdownItems}
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
              clusterAzureResourceGroup
            }}
          />
          <ConfirmModal
            message={removeMessage}
            isOpen={isConfirmOpen}
            onHandleClose={handleRemoveCluster}
            id="confirm-cluster-removal"
          />
        </DataListAction>,
      </DataListItemRow>
    </DataListItem>
  );
};
export default ClusterItem;
