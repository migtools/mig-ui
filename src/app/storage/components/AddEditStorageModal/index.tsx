import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import AddEditStorageForm from './AddEditStorageForm';
import { StorageActions } from '../../duck/actions';
import { Modal } from '@patternfly/react-core';
import { PollingContext, StorageContext } from '../../../home/duck/context';
import {
  AddEditMode,
  defaultAddEditStatus,
  createAddEditStatus,
  AddEditState,
} from '../../../common/add_edit_state';

const AddEditStorageModal = ({
  addEditStatus,
  isOpen,
  isPolling,
  storageList,
  checkConnection,
  isLoadingStorage,
  initialStorageValues,
  ...props
}) => {
  const pollingContext = useContext(PollingContext);
  const storageContext = useContext(StorageContext);

  const onAddEditSubmit = (storageValues) => {
    switch (addEditStatus.mode) {
      case AddEditMode.Edit: {
        props.updateStorage(storageValues);
        break;
      }
      case AddEditMode.Add: {
        props.addStorage(storageValues);
        storageContext.setCurrentStorage(storageValues.name);
        break;
      }
      default: {
        console.warn(
          `onAddEditSubmit, but unknown mode was found: ${addEditStatus.mode}. Ignoring.`
        );
      }
    }
  };

  useEffect(() => {
    if (isOpen && isPolling) {
      pollingContext.stopAllPolling();
    }
  });

  const onClose = () => {
    props.cancelAddEditWatch();
    props.resetAddEditState();
    props.onHandleClose();
    pollingContext.startAllDefaultPolling();
  };

  const modalTitle =
    addEditStatus.mode === AddEditMode.Edit
      ? 'Edit replication repository'
      : 'Add replication repository';

  return (
    <Modal
      isSmall
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
  })
)(AddEditStorageModal);
