import React, { useState, useContext } from 'react';
import { ModalContext } from '../../../../home/duck/context';
import StorageItem from './StorageItem';
import { Flex, Box } from '@rebass/emotion';
import AddEditStorageModal from '../../../../storage/components/AddEditStorageModal';
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
  const [isOpen, toggleOpen] = useState(false);
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
            <Button onClick={() => modalContext.setIsModalOpen(true)} variant="primary">
              Add repository
          </Button>
          </EmptyState>
        )}
      {/* {modalContext.isModalOpen &&
        <AddEditStorageModal
          isOpen={modalContext.isModalOpen}
          onHandleClose={() => modalContext.setIsModalOpen(false)}
        /> */}
      }
    </DataListContent>
  );
};
export default StorageContent;
