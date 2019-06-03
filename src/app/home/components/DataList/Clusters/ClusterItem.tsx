import React, { Component } from 'react';
import { Flex, Box } from '@rebass/emotion';
import {
  Button,
  DataListItem,
  DataListCell,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';
import StatusIcon from '../../../../common/components/StatusIcon';
import { LinkIcon } from '@patternfly/react-icons';
import { useOpenModal } from '../../../duck/hooks';
import AddClusterModal from '../../../../cluster/components/AddClusterModal';
import ConfirmModal from '../../../../common/components/ConfimModal';

const ClusterItem = ({ cluster, clusterIndex, isLoading, migMeta, removeCluster, ...props }) => {
  const clusterName = cluster.MigCluster.metadata.name;
  let clusterStatus;
  if (typeof cluster.MigCluster.status === 'undefined' || cluster.MigCluster.status === null) {
    clusterStatus = null;
  } else {
    clusterStatus = cluster.MigCluster.status.conditions[0].type;
  }
  const clusterUrl = cluster.MigCluster.spec.isHostCluster
    ? migMeta.clusterApi
    : cluster.Cluster.spec.kubernetesApiEndpoints.serverEndpoints[0].serverAddress;

  const clusterSvcToken = cluster.Secret.data.saToken ? atob(cluster.Secret.data.saToken) : null;

  const associatedPlanCount = props.associatedPlans[clusterName];
  const planText = associatedPlanCount === 1 ? 'plan' : 'plans';

  const [isOpen, toggleOpen] = useOpenModal(false);
  const [isConfirmOpen, toggleConfirmOpen] = useOpenModal(false);

  const removeMessage = `Are you sure you want to remove "${clusterName}"`;

  const handleRemoveCluster = isConfirmed => {
    if (isConfirmed) {
      removeCluster(clusterName);
      toggleConfirmOpen();
    } else {
      toggleConfirmOpen();
    }
  };

  return (
    <DataListItem key={clusterIndex} aria-labelledby="cluster-item">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="name" width={1}>
              <StatusIcon status={clusterStatus} />
              <span id="cluster-name">{clusterName}</span>
            </DataListCell>,
            <DataListCell key="url" width={2}>
              <a target="_blank" href={clusterUrl}>
                {clusterUrl}
              </a>
            </DataListCell>,
            <DataListCell key="count" width={2}>
              <LinkIcon /> {associatedPlanCount} associated migration {planText}
            </DataListCell>,
            <DataListCell key="actions" width={2}>
              <Flex justifyContent="flex-end">
                <Box mx={1}>
                  <Button onClick={toggleOpen} variant="secondary">
                    Edit
                  </Button>
                  <AddClusterModal
                    isOpen={isOpen}
                    onHandleClose={toggleOpen}
                    name={clusterName}
                    url={clusterUrl}
                    token={clusterSvcToken}
                    mode="update"
                  />
                </Box>
                <Box mx={1}>
                  <Button onClick={toggleConfirmOpen} variant="danger" key="remove-action">
                    Remove
                  </Button>
                  <ConfirmModal
                    message={removeMessage}
                    isOpen={isConfirmOpen}
                    onHandleClose={handleRemoveCluster}
                    id="confirm-cluster-removal"
                  />
                </Box>
              </Flex>
            </DataListCell>,
          ]}
        />
      </DataListItemRow>
    </DataListItem>
  );
};
export default ClusterItem;
