/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import AddEditClusterForm from './AddEditClusterForm';
import { Modal } from '@patternfly/react-core';
import { Creators } from '../../duck/actions';
import {
  defaultAddEditStatus,
  AddEditMode,
} from '../../../common/add_edit_state';
import { PollingContext } from '../../../home/duck/context';

const AddEditClusterModal = ({
  addEditStatus,
  initialClusterValues,
  isOpen,
  isPolling,
  ...props
}) => {
  const pollingContext = useContext(PollingContext);
  const onAddEditSubmit = (clusterValues) => {
    switch(addEditStatus.mode) {
      case AddEditMode.Edit: {
        props.updateCluster(clusterValues);
        break;
      }
      case AddEditMode.Add: {
        props.addCluster(clusterValues);
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
    <Modal isSmall isOpen={isOpen} onClose={onClose} title="Cluster">
      <AddEditClusterForm
        onAddEditSubmit={onAddEditSubmit}
        onClose={onClose}
        addEditStatus={addEditStatus}
        initialClusterValues={initialClusterValues}
      />
    </Modal>
  );
}

export default connect(
  state => {
    return {
      addEditStatus: state.cluster.addEditStatus,
      isPolling: state.cluster.isPolling,
    };
  },
  dispatch => ({
    addCluster: clusterValues => dispatch(Creators.addClusterRequest(clusterValues)),
    updateCluster: updatedClusterValues => dispatch(
      Creators.updateClusterRequest(updatedClusterValues)),
    cancelAddEditWatch: () => dispatch(Creators.cancelWatchClusterAddEditStatus()),
    resetAddEditState: () => {
      dispatch(Creators.setClusterAddEditStatus(defaultAddEditStatus()));
    },
  })
)(AddEditClusterModal);
