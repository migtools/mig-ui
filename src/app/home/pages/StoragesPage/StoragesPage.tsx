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
  Bullseye,
  Spinner,
  EmptyStateVariant,
  EmptyStateBody,
} from '@patternfly/react-core';
import AddCircleOIcon from '@patternfly/react-icons/dist/js/icons/add-circle-o-icon';
import { StorageContext } from '../../duck/context';
import storageSelectors from '../../../storage/duck/selectors';
import { StorageActions } from '../../../storage/duck/actions';
import { createAddEditStatus, AddEditState, AddEditMode } from '../../../common/add_edit_state';
import { useOpenModal } from '../../duck';
import StoragesTable from './components/StoragesTable';
import AddEditStorageModal from './components/AddEditStorageModal';
import { IStorage } from '../../../storage/duck/types';
import { IPlanCountByResourceName } from '../../../common/duck/types';
import { DefaultRootState } from '../../../../configureStore';
import GlobalPageHeader from '../../../common/components/GlobalPageHeader/GlobalPageHeader';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

interface IStoragesPageBaseProps {
  currentStorage: IStorage;
  storageList: IStorage[];
  storageAssociatedPlans: IPlanCountByResourceName;
  watchStorageAddEditStatus: (storageName: string) => void;
  removeStorage: (storageName: string) => void;
  setCurrentStorage: (storage: IStorage) => void;
  isFetchingInitialStorages: boolean;
  isError: boolean;
}

const StoragesPageBase: React.FunctionComponent<IStoragesPageBaseProps> = ({
  currentStorage,
  setCurrentStorage,
  storageList,
  storageAssociatedPlans,
  watchStorageAddEditStatus,
  removeStorage,
  isFetchingInitialStorages,
  isError,
}: IStoragesPageBaseProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);
  const renderErrorState = () => (
    <EmptyState variant={EmptyStateVariant.small}>
      <EmptyStateIcon icon={ExclamationTriangleIcon} />
      <Title headingLevel="h5" size="lg">
        Failed to fetch replication repositories.
      </Title>
      <EmptyStateBody>Please try your request again.</EmptyStateBody>
    </EmptyState>
  );

  return (
    <>
      <GlobalPageHeader title="Replication repositories"></GlobalPageHeader>
      <PageSection>
        {isFetchingInitialStorages && !isError ? (
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        ) : (
          <Card>
            <CardBody>
              <StorageContext.Provider value={{ watchStorageAddEditStatus }}>
                {!storageList ? null : storageList.length === 0 ? (
                  <EmptyState variant="full">
                    <EmptyStateIcon icon={AddCircleOIcon} />
                    <Title headingLevel="h3" size="lg">
                      Add replication repositories for the migration
                    </Title>
                    <Button onClick={toggleAddEditModal} variant="primary">
                      Add replication repository
                    </Button>
                  </EmptyState>
                ) : isError ? (
                  renderErrorState()
                ) : (
                  <StoragesTable
                    storageList={storageList}
                    associatedPlans={storageAssociatedPlans}
                    toggleAddEditModal={toggleAddEditModal}
                    removeStorage={removeStorage}
                    setCurrentStorage={setCurrentStorage}
                    currentStorage={currentStorage}
                  />
                )}
                <AddEditStorageModal
                  isOpen={isAddEditModalOpen}
                  onHandleClose={() => {
                    toggleAddEditModal();
                  }}
                />
              </StorageContext.Provider>
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

const mapStateToProps = (state: DefaultRootState) => ({
  storageList: storageSelectors.getAllStorage(state),
  storageAssociatedPlans: storageSelectors.getAssociatedPlans(state),
  isFetchingInitialStorages: state.storage.isFetchingInitialStorages,
  currentStorage: state.storage.currentStorage,
  isError: state.storage.isError,
});

const mapDispatchToProps = (dispatch: any) => ({
  watchStorageAddEditStatus: (storageName: string) => {
    // Push the add edit status into watching state, and start watching
    dispatch(
      StorageActions.setStorageAddEditStatus(
        createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
      )
    );
    dispatch(StorageActions.watchStorageAddEditStatus(storageName));
  },
  removeStorage: (storageName: string) =>
    dispatch(StorageActions.removeStorageRequest(storageName)),
  setCurrentStorage: (storage: IStorage) => dispatch(StorageActions.setCurrentStorage(storage)),
});

export const StoragesPage = connect(mapStateToProps, mapDispatchToProps)(StoragesPageBase);
