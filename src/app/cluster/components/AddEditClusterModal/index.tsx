/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import AddEditClusterForm from './AddEditClusterForm';
import { Modal } from '@patternfly/react-core';
import { ClusterActions } from '../../duck/actions';
import {
  defaultAddEditStatus,
  AddEditMode,
  createAddEditStatus,
  AddEditState,
} from '../../../common/add_edit_state';
import { PollingContext } from '../../../home/duck/context';

const AddEditClusterModal = ({
  addEditStatus,
  initialClusterValues,
  isOpen,
  isPolling,
  checkConnection,
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
  };

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
  };

  const modalTitle = addEditStatus.mode === AddEditMode.Edit ?
    'Edit Cluster' : 'Add Cluster';

  return (
    <Modal isSmall isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <AddEditClusterForm
        onAddEditSubmit={onAddEditSubmit}
        onClose={onClose}
        addEditStatus={addEditStatus}
        initialClusterValues={initialClusterValues}
        checkConnection={checkConnection}
      />
    </Modal>
  );
};

export default connect(
  state => {
    return {
      addEditStatus: state.cluster.addEditStatus,
      isPolling: state.cluster.isPolling,
    };
  },
  dispatch => ({
    addCluster: clusterValues => dispatch(ClusterActions.addClusterRequest(clusterValues)),
    updateCluster: updatedClusterValues => dispatch(
      ClusterActions.updateClusterRequest(updatedClusterValues)),
    checkConnection: (clusterName: string) => {
      dispatch(ClusterActions.setClusterAddEditStatus(createAddEditStatus(
        AddEditState.Fetching, AddEditMode.Edit,
      )));
      dispatch(ClusterActions.watchClusterAddEditStatus(clusterName));
    },
    cancelAddEditWatch: () => dispatch(ClusterActions.cancelWatchClusterAddEditStatus()),
    resetAddEditState: () => {
      dispatch(ClusterActions.setClusterAddEditStatus(defaultAddEditStatus()));
    },
  })
)(AddEditClusterModal);
