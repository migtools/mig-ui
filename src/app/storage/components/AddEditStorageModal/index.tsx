/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import AddEditStorageForm from './AddEditStorageForm';
import { StorageActions } from '../../duck/actions';
import {
  Button,
  Modal
} from '@patternfly/react-core';
import { PollingContext } from '../../../home/duck/context';
import {
  AddEditMode,
  defaultAddEditStatus,
  createAddEditStatus,
  AddEditState,
 } from '../../../common/add_edit_state';

const AddEditStorageModal = ({
  addEditStatus,
  initialStorageValues,
  isOpen,
  isPolling,
  storageList,
  checkConnection,
  ...props
}) => {
  const pollingContext = useContext(PollingContext);
  const [currentStorageName, setCurrentStorageName] =
    useState(initialStorageValues ? initialStorageValues.name : null);

  const onAddEditSubmit = (storageValues) => {
    switch(addEditStatus.mode) {
      case AddEditMode.Edit: {
        props.updateStorage(storageValues);
        break;
      }
      case AddEditMode.Add: {
        props.addStorage(storageValues);
        setCurrentStorageName(storageValues.name);
        break;
      }
      default: {
        console.warn(
          `onAddEditSubmit, but unknown mode was found: ${addEditStatus.mode}. Ignoring.`, );
      }
    }
  };

  useEffect(() => {
    if(isOpen && isPolling) {
      pollingContext.stopAllPolling();
    }
  });

  const onClose = () => {
    props.cancelAddEditWatch();
    props.resetAddEditState();
    setCurrentStorageName(null);
    props.onHandleClose();
    pollingContext.startAllDefaultPolling();
  };


  const modalTitle = addEditStatus.mode === AddEditMode.Edit ?
    'Edit repository' : 'Add repository';

  const currentStorage = storageList.find(s => {
    return s.MigStorage.metadata.name === currentStorageName;
  });

  return (
    <Modal
      isSmall
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      actions={[
        <Button key="confirm" variant="primary" onClick={this.handleModalToggle}>
          Add/Update repository
        </Button>,
        <Button key="cancel" variant="secondary" onClick={onClose}>
          Close
        </Button>
      ]}
      isFooterLeftAligned
    >
      <AddEditStorageForm
        onAddEditSubmit={onAddEditSubmit}
        onClose={onClose}
        addEditStatus={addEditStatus}
        initialStorageValues={initialStorageValues}
        currentStorage={currentStorage}
        checkConnection={checkConnection}
      />
    </Modal>
  );
};

export default connect(
  state => {
    return {
      addEditStatus: state.storage.addEditStatus,
      isPolling: state.storage.isPolling,
      storageList: state.storage.migStorageList,
    };
  },
  dispatch => ({
    addStorage: storageValues => dispatch(StorageActions.addStorageRequest(storageValues)),
    updateStorage: updatedStorageValues => dispatch(
      StorageActions.updateStorageRequest(updatedStorageValues)),
    cancelAddEditWatch: () => dispatch(StorageActions.cancelWatchStorageAddEditStatus()),
    resetAddEditState: () => {
      dispatch(StorageActions.setStorageAddEditStatus(defaultAddEditStatus()));
    },
    checkConnection: (storageName : string) => {
      dispatch(StorageActions.setStorageAddEditStatus(createAddEditStatus(
        AddEditState.Fetching, AddEditMode.Edit,
      )));
      dispatch(StorageActions.watchStorageAddEditStatus(storageName));
    },
  })
)(AddEditStorageModal);
