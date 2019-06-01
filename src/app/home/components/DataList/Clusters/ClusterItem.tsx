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

  const associatedPlanCount = props.associatedPlans[clusterName];
  const planText = associatedPlanCount === 1 ? 'plan' : 'plans';

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
                  <Button variant="secondary">Edit</Button>
                </Box>
                <Box mx={1}>
                    <Button onClick={() => {
                      // TODO:  Not sure best way to ensure that user wants to really delete this item.
                      if (confirm('Are you sure?')) {
                        removeCluster(clusterName);
                      }
                      }}
                      variant="danger"
                      key="remove-action"
                    >
                      Remove
                    </Button>
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
