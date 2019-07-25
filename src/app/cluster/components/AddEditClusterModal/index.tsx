import React from 'react';
import { connect } from 'react-redux';
import AddClusterForm from './AddEditClusterForm';
import { Modal } from '@patternfly/react-core';
import { Creators } from '../../duck/actions';
import { defaultAddEditStatus } from '../../../common/add_edit_state';

const AddEditClusterModal = (props) => {
  const onAddEditSubmit = (clusterValues) => {
    props.addCluster(clusterValues);
  }

  const onClose = () => {
    props.cancelAddEditWatch();
    props.resetAddEditState();
    props.onHandleClose();
  }

  return (
    <Modal isSmall isOpen={props.isOpen} onClose={props.onHandleClose} title="Cluster">
      <AddClusterForm
        onAddEditSubmit={onAddEditSubmit}
        onClose={onClose}
        addEditStatus={props.addEditStatus}
      />
    </Modal>
  );
}

export default connect(
  state => {
    return {
      addEditStatus: state.cluster.addEditStatus,
    };
  },
  dispatch => ({
    addCluster: clusterValues => dispatch(Creators.addClusterRequest(clusterValues)),
    cancelAddEditWatch: () => dispatch(Creators.cancelWatchClusterAddEditStatus()),
    resetAddEditState: () => {
      dispatch(Creators.setClusterAddEditStatus(defaultAddEditStatus()));
    },
    //updateCluster: values => dispatch(clusterOperations.updateCluster(values)),
  })
)(AddEditClusterModal);
