import React from 'react';
import { DataList, DataListContent } from '@patternfly/react-core';
import StorageItem from './StorageItem';
import { Flex, Box } from '@rebass/emotion';
import DataListEmptyState from '../DataListEmptyState';

const StorageContent = ({ dataList, isLoading, isExpanded, associatedPlans, ...props }) => {
  return (
    <DataListContent noPadding aria-label="storage-items-content-container" isHidden={!isExpanded}>
      {dataList.length > 0 ? (
        <DataList aria-label="storage-item-list">
          {dataList.map((storage, storageIndex) => {
            return (
              <StorageItem
                key={storageIndex}
                isLoading
                storage={storage}
                storageIndex={storageIndex}
                associatedPlans={associatedPlans}
              />
            );
          })}
        </DataList>
      ) : (
        <Flex alignItems="center" justifyContent="center">
          <Box>
            <DataListEmptyState type="storage" />
          </Box>
        </Flex>
      )}
    </DataListContent>
  );
};
export default StorageContent;
