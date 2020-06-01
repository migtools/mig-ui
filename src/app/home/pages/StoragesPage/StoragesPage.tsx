import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  Card,
  PageSection,
  TextContent,
  Text,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  Title,
  Button,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { StorageContext } from '../../duck/context';
import storageSelectors from '../../../storage/duck/selectors';
import { StorageActions } from '../../../storage/duck/actions';
import { createAddEditStatus, AddEditState, AddEditMode } from '../../../common/add_edit_state';
import { useOpenModal } from '../../duck/hooks';
import StoragesTable from './components/StoragesTable';
import AddEditStorageModal from './components/AddEditStorageModal';
import { IStorage } from '../../../storage/duck/types';
import { IPlanCountByResourceName } from '../../../common/duck/types';

interface IStoragesPageBaseProps {
  storageList: IStorage[];
  storageAssociatedPlans: IPlanCountByResourceName;
  watchStorageAddEditStatus: (storageName: string) => void;
  removeStorage: (storageName: string) => void;
}

// TODO each of these pages flashes the empty state while loading, we should show a loading spinner instead somehow.

const StoragesPageBase: React.FunctionComponent<IStoragesPageBaseProps> = ({
  storageList,
  storageAssociatedPlans,
  watchStorageAddEditStatus,
  removeStorage,
}: IStoragesPageBaseProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);
  const [currentStorage, setCurrentStorage] = useState(null);
  return (
    <>
      <PageSection variant="light">
        <TextContent>
          <Text component="h1" className={spacing.mbAuto}>
            Replication repositories
          </Text>
        </TextContent>
      </PageSection>
      <PageSection>
        <Card>
          <CardBody>
            <StorageContext.Provider
              value={{ watchStorageAddEditStatus, setCurrentStorage, currentStorage }}
            >
              {!storageList ? null : storageList.length === 0 ? (
                <EmptyState variant="full">
                  <EmptyStateIcon icon={AddCircleOIcon} />
                  <Title size="lg">Add replication repositories for the migration</Title>
                  <Button onClick={toggleAddEditModal} variant="primary">
                    Add replication repository
                  </Button>
                </EmptyState>
              ) : (
                <StoragesTable
                  storageList={storageList}
                  associatedPlans={storageAssociatedPlans}
                  toggleAddEditModal={toggleAddEditModal}
                  removeStorage={removeStorage}
                />
              )}
              <AddEditStorageModal
                isOpen={isAddEditModalOpen}
                onHandleClose={() => {
                  toggleAddEditModal();
                  setCurrentStorage(null);
                }}
              />
            </StorageContext.Provider>
          </CardBody>
        </Card>
      </PageSection>
    </>
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
