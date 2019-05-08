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

const ClusterItem = ({ cluster, clusterIndex, isLoading, ...props }) => {
  const clusterName = cluster.MigCluster.metadata.name;
  const clusterStatus = cluster.status;
  const clusterUrl =
    cluster.Cluster.spec.kubernetesApiEndpoints.serverEndpoints[0].serverAddress;

  const associatedPlanCount = props.associatedPlans[clusterName];
  const planText = associatedPlanCount === 1 ? 'plan' : 'plans';

  return (
    <DataListItem
      key={clusterIndex}
      aria-labelledby="cluster-item"
    >
        <DataListItemRow>
          <DataListItemCells
            dataListCells={[
              <DataListCell key="name" width={1}>
                <StatusIcon status={clusterStatus} />
                <span id="cluster-name">{clusterName}</span>
              </DataListCell>,
              <DataListCell key="url" width={2}>
                <a
                  target="_blank"
                  href={clusterUrl}
                >
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
                    <Button
                      variant="danger"
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
