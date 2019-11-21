import React, { useState } from 'react';
import { DataList, DataListContent } from '@patternfly/react-core';
import ClusterItem from './ClusterItem';
import { AddCircleOIcon } from '@patternfly/react-icons';
import AddEditClusterModal from '../../../../cluster/components/AddEditClusterModal';
import { Button, Title, EmptyState, EmptyStateIcon } from '@patternfly/react-core';

const ClusterContent = ({
  dataList,
  isExpanded,
  associatedPlans,
  migMeta,
  removeCluster,
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
          <EmptyState variant="full">
            <EmptyStateIcon icon={AddCircleOIcon} />
            <Title size="lg">Add source and target clusters for the migration</Title>
            <Button onClick={() => toggleOpen(!isOpen)} variant="primary">
              Add cluster
          </Button>
          </EmptyState>
        )}
      <AddEditClusterModal
        isOpen={isOpen}
        onHandleClose={toggleOpen}
      />
    </DataListContent>
  );
};
export default ClusterContent;
