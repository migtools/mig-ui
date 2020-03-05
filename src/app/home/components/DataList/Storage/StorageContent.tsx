import React, { useContext } from 'react';
import { ModalContext } from '../../../../home/duck/context';
import StorageItem from './StorageItem';
import {
  DataList,
  DataListContent,
  Button,
  Title,
  EmptyState,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';

const StorageContent = ({
  dataList,
  isExpanded,
  associatedPlans,
  removeStorage,
}) => {
  const modalContext = useContext(ModalContext);

  return (
    <DataListContent noPadding aria-label="storage-items-content-container" isHidden={!isExpanded}>
      {dataList.length > 0 ? (
        <DataList aria-label="storage-item-list">
          {dataList.map((storage, storageIndex) => {
            return (
              <StorageItem
                key={storageIndex}
                storage={storage}
                storageIndex={storageIndex}
                associatedPlans={associatedPlans}
                removeStorage={removeStorage}
              />
            );
          })}
        </DataList>
      ) : (
        <EmptyState variant="full">
          <EmptyStateIcon icon={AddCircleOIcon} />
          <Title size="lg">Add replication repositories for the migration</Title>
          <Button onClick={() => {
            modalContext.setIsModalOpen(true);
          }} variant="primary">
              Add replication repository
          </Button>
        </EmptyState>
      )}
    </DataListContent>
  );
};
export default StorageContent;
