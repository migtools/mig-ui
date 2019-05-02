import React from 'react';
import {
  Button,
  DataListItem,
  DataListCell,
  DataListToggle,
  DataListItemRow,
  DataListItemCells,
  DataListAction,
} from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import DataListEmptyState from '../DataListEmptyState';
import { useExpandDataList, useOpenModal } from '../../../duck/hooks';
import { PlusCircleIcon } from '@patternfly/react-icons';
import AddStorageModal from '../../../../storage/components/AddStorageModal';
import StorageContent from './StorageContent';

const StorageDataListItem = ({ dataList, isLoading, associatedPlans, ...props }) => {
  const [isExpanded, toggleExpanded] = useExpandDataList(false);
  const [isOpen, toggleOpen] = useOpenModal(false);
  if (dataList) {
    return (
      <DataListItem aria-labelledby="storage-container-item" isExpanded={isExpanded}>
        <DataListItemRow>
          <DataListToggle
            onClick={() => toggleExpanded()}
            isExpanded={isExpanded}
            id='storage-toggle'
          />
          <DataListItemCells
            dataListCells={[
              <DataListCell
                id="storage-item"
                key="storage"
              >
                <span id="name" >Repositories</span>
              </DataListCell>,
            ]} />
          <DataListAction aria-label="add-plan" aria-labelledby="plan-item" id="add-plan">
            <Button onClick={toggleOpen} variant="link">
              <PlusCircleIcon /> Add storage
            </Button>
            <AddStorageModal isOpen={isOpen} onHandleClose={toggleOpen} />
          </DataListAction>
        </DataListItemRow>
        {
          dataList.length > 0 ? (
            <StorageContent
              associatedPlans={associatedPlans}
              dataList={dataList}
              isLoading={isLoading}
              isExpanded={isExpanded}
              {...props}
            />
          ) : (
              <Flex alignItems="center" justifyContent="center">
                <Box>
                  <DataListEmptyState type="storage" />
                </Box>
              </Flex>
            )}

      </DataListItem >
    );
  }
  return null;
};

export default StorageDataListItem;
