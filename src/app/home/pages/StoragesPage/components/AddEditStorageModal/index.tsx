import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import AddEditStorageForm from './AddEditStorageForm';
import { StorageActions } from '../../../../../storage/duck/actions';
import { Modal } from '@patternfly/react-core';
import { StorageContext } from '../../../../duck/context';
import {
  AddEditMode,
  defaultAddEditStatus,
  createAddEditStatus,
  AddEditState,
  IAddEditStatus,
} from '../../../../../common/add_edit_state';
import { IStorage } from '../../../../../storage/duck/types';

interface IAddEditClusterModal {
  addEditStatus: IAddEditStatus;
  isOpen: boolean;
  isPolling: boolean;
  checkConnection: (name) => void;
  storageList: IStorage[];
  addStorage: (storage) => void;
  cancelAddEditWatch: () => void;
  onHandleClose: () => void;
  resetAddEditState: () => void;
  resetStoragePage: () => void;
  updateStorage: (updatedStorage) => void;
  setCurrentStorage: (currentStorage: IStorage) => void;
  currentStorage: IStorage;
}
const AddEditStorageModal = ({
  addEditStatus,
  isOpen,
  storageList,
  checkConnection,
  updateStorage,
  addStorage,
  cancelAddEditWatch,
  resetAddEditState,
  onHandleClose,
  resetStoragePage,
  setCurrentStorage,
  currentStorage,
}: IAddEditClusterModal) => {
  const onAddEditSubmit = (storageValues) => {
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
        checkConnection={checkConnection}
        storageList={storageList}
        currentStorage={currentStorage}
      />
    </Modal>
  );
};

export default connect(
  (state) => {
    return {
      addEditStatus: state.storage.addEditStatus,
      isPolling: state.storage.isPolling,
      storageList: state.storage.migStorageList,
      isLoadingStorage: state.storage.isLoadingStorage,
      currentStorage: state.storage.currentStorage,
    };
  },
  (dispatch) => ({
    addStorage: (storageValues) => dispatch(StorageActions.addStorageRequest(storageValues)),
    updateStorage: (updatedStorageValues) =>
      dispatch(StorageActions.updateStorageRequest(updatedStorageValues)),
    cancelAddEditWatch: () => dispatch(StorageActions.cancelWatchStorageAddEditStatus()),
    resetAddEditState: () => {
      dispatch(StorageActions.setStorageAddEditStatus(defaultAddEditStatus()));
    },
    checkConnection: (storageName: string) => {
      dispatch(
        StorageActions.setStorageAddEditStatus(
          createAddEditStatus(AddEditState.Fetching, AddEditMode.Edit)
        )
      );
      dispatch(StorageActions.watchStorageAddEditStatus(storageName));
    },
    resetStoragePage: () => dispatch(StorageActions.resetStoragePage()),
    setCurrentStorage: (currentStorage: IStorage) =>
      dispatch(StorageActions.setCurrentStorage(currentStorage)),
  })
)(AddEditStorageModal);
