import React, { useContext } from 'react';
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
import AddEditClusterModal from '../../../../cluster/components/AddEditClusterModal';
import ConfirmModal from '../../../../common/components/ConfirmModal';
import { ClusterContext } from '../../../duck/context';

const ClusterItem = ({ cluster, clusterIndex, isLoading, migMeta, removeCluster, ...props }) => {
  const clusterName = cluster.MigCluster.metadata.name;
  let clusterStatus = null;
  if (cluster.MigCluster.status) {
    clusterStatus = cluster.MigCluster.status.conditions.filter(c => c.type === 'Ready').length > 0;
  }
  const clusterUrl = cluster.MigCluster.spec.isHostCluster
    ? migMeta.clusterApi
    : cluster.Cluster.spec.kubernetesApiEndpoints.serverEndpoints[0].serverAddress;

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

  return (
    <DataListItem key={clusterIndex} aria-labelledby="cluster-item">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="name" width={1}>
              <StatusIcon isReady={clusterStatus} />
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
                  <Button
                    onClick={editCluster}
                    variant="secondary"
                    isDisabled={isHostCluster}
                  >
                    Edit
                  </Button>
                  <AddEditClusterModal
                    isOpen={isAddEditOpen}
                    onHandleClose={toggleIsAddEditOpen}
                    initialClusterValues={{clusterName, clusterUrl, clusterSvcToken}}
                  />
                </Box>
                <Box mx={1}>
                  <Button
                    onClick={toggleConfirmOpen}
                    variant="danger"
                    isDisabled={isHostCluster}
                    key="remove-action"
                  >
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
