import React, { useState, createContext } from 'react';
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
import { ModalContext } from '../../../duck/context';


const StorageDataListItem = ({
  id,
  dataList,
  associatedPlans,
  removeStorage,
  isExpanded,
  toggleExpanded,
  storageCount,
  ...props }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (dataList) {
    return (
      <ModalContext.Provider value={{ setIsModalOpen, isModalOpen }}>
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
                      <Badge isRead>{storageCount}</Badge>
                    </div>
                  </div>

                </DataListCell>,
              ]}
            />
            <DataListAction aria-label="add-plan" aria-labelledby="plan-item" id="add-plan">
              <Button onClick={() => setIsModalOpen(true)} variant="secondary" id="add-repo-btn">
                Add repository
            </Button>
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
      </ModalContext.Provider>
    );
  }
  return null;
};

export default StorageDataListItem;
