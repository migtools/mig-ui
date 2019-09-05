import React from 'react';
import {
  Badge,
  Button,
  DataListItem,
  DataListCell,
  DataListToggle,
  DataListItemRow,
  DataListItemCells,
  DataListAction,
} from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import { PlusCircleIcon } from '@patternfly/react-icons';
import AddEditStorageModal from '../../../../storage/components/AddEditStorageModal';
import StorageContent from './StorageContent';

const StorageDataListItem = ({
  id,
  dataList,
  associatedPlans,
  removeStorage,
  isExpanded,
  toggleExpanded,
  ...props }) => {
  const [isOpen, toggleOpen] = useOpenModal(false);
  if (dataList) {
    return (
      <DataListItem aria-labelledby="storage-container-item" isExpanded={isExpanded}>
        <DataListItemRow>
          <DataListToggle
            onClick={() => toggleExpanded(id)}
            isExpanded={isExpanded}
            id="storage-toggle"
          />
          <DataListItemCells
            dataListCells={[
              <DataListCell id="storage-item" key="storage">
                <div className="pf-l-flex">
                  <div className="pf-l-flex__item">
                    <span id="repos">Repositories</span>
                  </div>
                  <div className="pf-l-flex__item">
                    <Badge isRead>7</Badge>
                  </div>
                </div>

              </DataListCell>,
            ]}
          />
          <DataListAction aria-label="add-plan" aria-labelledby="plan-item" id="add-plan">
            <Button onClick={toggleOpen} variant="secondary" id="add-repo-btn">
              Add repository
            </Button>
            <AddEditStorageModal
              isOpen={isOpen}
              onHandleClose={toggleOpen}
            />
          </DataListAction>
        </DataListItemRow>
        <StorageContent
          associatedPlans={associatedPlans}
          dataList={dataList}
          isExpanded={isExpanded}
          removeStorage={removeStorage}
          {...props}
        />
      </DataListItem>
    );
  }
  return null;
};

export default StorageDataListItem;
