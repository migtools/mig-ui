/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import AddEditStorageForm from './AddEditStorageForm';
import { Creators } from '../../duck/actions';
import { Modal } from '@patternfly/react-core';
import { PollingContext } from '../../../home/duck/context';
import { AddEditMode, defaultAddEditStatus } from '../../../common/add_edit_state';

const AddEditStorageModal = ({
  addEditStatus,
  initialStorageValues,
  isOpen,
  isPolling,
  ...props
}) => {
  const pollingContext = useContext(PollingContext);
  const onAddEditSubmit = (storageValues) => {
    switch(addEditStatus.mode) {
      case AddEditMode.Edit: {
        props.updateStorage(storageValues);
        break;
      }
      case AddEditMode.Add: {
        props.addStorage(storageValues);
        break;
      }
      default: {
        console.warn(
          `onAddEditSubmit, but unknown mode was found: ${addEditStatus.mode}. Ignoring.`, );
      }
    }
  }

  useEffect(() => {
    if(isOpen && isPolling) {
      pollingContext.stopAllPolling();
    }
  });

  const onClose = () => {
    props.cancelAddEditWatch();
    props.resetAddEditState();
    props.onHandleClose();
    pollingContext.startAllDefaultPolling();
  }

  return (
    <Modal isSmall isOpen={isOpen} onClose={onClose} title="Repository">
      <AddEditStorageForm
        onAddEditSubmit={onAddEditSubmit}
        onClose={onClose}
        addEditStatus={addEditStatus}
        initialStorageValues={initialStorageValues}
      />
    </Modal>
  )
}

export default connect(
  state => {
    return {
      addEditStatus: state.storage.addEditStatus,
      isPolling: state.storage.isPolling,
    };
  },
  dispatch => ({
    addStorage: storageValues => dispatch(Creators.addStorageRequest(storageValues)),
    updateStorage: updatedStorageValues => dispatch(
      Creators.updateStorageRequest(updatedStorageValues)),
    cancelAddEditWatch: () => dispatch(Creators.cancelWatchStorageAddEditStatus()),
    resetAddEditState: () => {
      dispatch(Creators.setStorageAddEditStatus(defaultAddEditStatus()));
    },
  })
)(AddEditStorageModal);
