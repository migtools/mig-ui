import React from 'react';
import { connect } from 'react-redux';
import AddClusterForm from './AddEditClusterForm';
import { Modal } from '@patternfly/react-core';
import { Creators } from '../../duck/actions';

const AddEditClusterModal = (props) => {
  const onAddEditSubmit = (clusterValues) => {
    props.addCluster(clusterValues);
  }

  const onClose = () => {
    props.onHandleClose();
  }

  return (
    <Modal isSmall isOpen={props.isOpen} onClose={props.onHandleClose} title="Cluster">
      <AddClusterForm
        onAddEditSubmit={onAddEditSubmit}
        onClose={onClose}
      />
    </Modal>
  );
}

export default connect(
  state => {
    return {
    };
  },
  dispatch => ({
    addCluster: clusterValues => dispatch(Creators.addClusterRequest(clusterValues)),
    //updateCluster: values => dispatch(clusterOperations.updateCluster(values)),
  })
)(AddEditClusterModal);
