import React, { useState } from 'react';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../../../../theme';
import { DataList, DataListContent } from '@patternfly/react-core';
import ClusterItem from './ClusterItem';
import { AddCircleOIcon } from '@patternfly/react-icons';
import AddClusterModal from '../../../../cluster/components/AddClusterModal';
import { Button, Title, EmptyState, EmptyStateIcon } from '@patternfly/react-core';

const ClusterContent = ({
  dataList,
  isLoading,
  isExpanded,
  associatedPlans,
  migMeta,
  removeCluster,
  ...props
}) => {
  const [isOpen, toggleOpen] = useState(false);
  return (
    <DataListContent noPadding aria-label="cluster-items-content-container" isHidden={!isExpanded}>
      {dataList.length > 0 ? (
        <DataList aria-label="cluster-item-list">
          {dataList.map((cluster, clusterIndex) => {
            return (
              <ClusterItem
                key={clusterIndex}
                isLoading
                cluster={cluster}
                clusterIndex={clusterIndex}
                migMeta={migMeta}
                removeCluster={removeCluster}
                associatedPlans={associatedPlans}
              />
            );
          })}
        </DataList>
      ) : (
        <Flex alignItems="center" justifyContent="center">
          <Box>
            <EmptyState variant="large">
              <EmptyStateIcon icon={AddCircleOIcon} />
              <Title size="lg">Add source and target clusters for the migration</Title>
              <Button onClick={() => toggleOpen(!isOpen)} variant="primary">
                Add Cluster
              </Button>
              <AddClusterModal isOpen={isOpen} onHandleClose={toggleOpen} />
            </EmptyState>
          </Box>
        </Flex>
      )}
    </DataListContent>
  );
};
export default ClusterContent;
