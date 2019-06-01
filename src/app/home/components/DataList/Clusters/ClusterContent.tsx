import React, { Component } from 'react';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../../../../theme';
import { DataList, DataListContent } from '@patternfly/react-core';
import ClusterItem from './ClusterItem';
import DataListEmptyState from '../DataListEmptyState';

const ClusterContent = ({
  dataList,
  isLoading,
  isExpanded,
  associatedPlans,
  migMeta,
  removeCluster,
  ...props
}) => {
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
            <DataListEmptyState type="cluster" />
          </Box>
        </Flex>
      )}
    </DataListContent>
  );
};
export default ClusterContent;
