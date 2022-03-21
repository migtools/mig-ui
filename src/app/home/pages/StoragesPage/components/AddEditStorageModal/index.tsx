import React from 'react';
import { connect } from 'react-redux';
import AddEditStorageForm from './AddEditStorageForm';
import { StorageActions } from '../../../../../storage/duck/actions';
import { Modal } from '@patternfly/react-core';
import {
  AddEditMode,
  defaultAddEditStatus,
  IAddEditStatus,
} from '../../../../../common/add_edit_state';
import { IStorage } from '../../../../../storage/duck/types';
import { DefaultRootState } from '../../../../../../configureStore';

interface IAddEditClusterModal {
  addEditStatus: IAddEditStatus;
  isOpen: boolean;
  isPolling: boolean;
  storageList: IStorage[];
  addStorage: (storage: any) => void;
  cancelAddEditWatch: () => void;
  onHandleClose: () => void;
  resetAddEditState: () => void;
  resetStoragePage: () => void;
  updateStorage: (updatedStorage: any) => void;
  setCurrentStorage: (currentStorage: IStorage) => void;
  currentStorage: IStorage;
}
const AddEditStorageModal = ({
  addEditStatus,
  isOpen,
  storageList,
  updateStorage,
  addStorage,
  cancelAddEditWatch,
  resetAddEditState,
  onHandleClose,
  resetStoragePage,
  setCurrentStorage,
  currentStorage,
}: IAddEditClusterModal | any) => {
  //TODO: Remove explicit any when we refactor to use redux hooks api
  const onAddEditSubmit = (storageValues: any) => {
    switch (addEditStatus.mode) {
      case AddEditMode.Edit: {
        updateStorage(storageValues);
        break;
      }
      case AddEditMode.Add: {
        addStorage(storageValues);
        break;
      }
      default: {
        console.warn(
          `onAddEditSubmit, but unknown mode was found: ${addEditStatus.mode}. Ignoring.`
        );
      }
    }
  };

  const onClose = () => {
    cancelAddEditWatch();
    resetAddEditState();
    onHandleClose();
    resetStoragePage();
    setCurrentStorage(null);
  };

  const modalTitle =
    addEditStatus.mode === AddEditMode.Edit
      ? 'Edit replication repository'
      : 'Add replication repository';

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      className="storage-modal-modifier always-scroll"
    >
      <AddEditStorageForm
        onAddEditSubmit={onAddEditSubmit}
        onClose={onClose}
        addEditStatus={addEditStatus}
        storageList={storageList}
        currentStorage={currentStorage}
      />
    </Modal>
  );
};

export default connect(
  (state: DefaultRootState) => {
    return {
      addEditStatus: state.storage.addEditStatus,
      isPolling: state.storage.isPolling,
      storageList: state.storage.migStorageList,
      isLoadingStorage: state.storage.isLoadingStorage,
      currentStorage: state.storage.currentStorage,
    };
  },
  (dispatch) => ({
    addStorage: (storageValues: any) => dispatch(StorageActions.addStorageRequest(storageValues)),
    updateStorage: (updatedStorageValues: any) =>
      dispatch(StorageActions.updateStorageRequest(updatedStorageValues)),
    cancelAddEditWatch: () => dispatch(StorageActions.cancelWatchStorageAddEditStatus()),
    resetAddEditState: () => {
      dispatch(StorageActions.setStorageAddEditStatus(defaultAddEditStatus()));
    },
    resetStoragePage: () => dispatch(StorageActions.resetStoragePage()),
    setCurrentStorage: (currentStorage: IStorage) =>
      dispatch(StorageActions.setCurrentStorage(currentStorage)),
  })
)(AddEditStorageModal);
