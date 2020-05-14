import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Card, PageSection, DataList } from '@patternfly/react-core';
import { DataListItems } from '../HomeComponent';
import { StorageContext } from '../duck/context';
import storageSelectors from '../../storage/duck/selectors';
import { StorageActions } from '../../storage/duck/actions';
import { createAddEditStatus, AddEditState, AddEditMode } from '../../common/add_edit_state';
import StorageDataListItem from '../components/DataList/Storage/StorageDataListItem';

interface IStoragesPageBaseProps {
  storageList: any[]; // TODO type?
  storageAssociatedPlans: { [clusterName: string]: any }; // TODO types? MigPlan? lift to a common import
  watchStorageAddEditStatus: (id: string) => void;
  removeStorage: (id: string) => void;
}

const StoragesPageBase: React.FunctionComponent<IStoragesPageBaseProps> = ({
  storageList,
  storageAssociatedPlans,
  watchStorageAddEditStatus,
  removeStorage,
}: IStoragesPageBaseProps) => {
  const [currentStorage, setCurrentStorage] = useState(null);
  return (
    <PageSection>
      <Card>
        <DataList aria-label="data-list-main-container">
          <StorageContext.Provider
            value={{ watchStorageAddEditStatus, setCurrentStorage, currentStorage }}
          >
            <StorageDataListItem
              dataList={storageList}
              id={DataListItems.StorageList}
              associatedPlans={storageAssociatedPlans}
              removeStorage={removeStorage}
              isExpanded
              storageCount={storageList.length}
            />
          </StorageContext.Provider>
        </DataList>
      </Card>
    </PageSection>
  );
};

// TODO type for state arg? inherit from reducer?
const mapStateToProps = (state) => ({
  storageList: storageSelectors.getAllStorage(state),
  storageAssociatedPlans: storageSelectors.getAssociatedPlans(state),
});

// TODO types for dispatch arg and args of each action prop?
const mapDispatchToProps = (dispatch) => ({
  watchStorageAddEditStatus: (storageName) => {
    // Push the add edit status into watching state, and start watching
    dispatch(
      StorageActions.setStorageAddEditStatus(
        createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
      )
    );
    dispatch(StorageActions.watchStorageAddEditStatus(storageName));
  },
  removeStorage: (name) => dispatch(StorageActions.removeStorageRequest(name)),
});

export const StoragesPage = connect(mapStateToProps, mapDispatchToProps)(StoragesPageBase);
