import React from 'react';
import { connect } from 'react-redux';
import AddClusterForm from './AddEditClusterForm';
import { clusterOperations } from '../../duck';
import { Modal } from '@patternfly/react-core';

const AddEditClusterModal = (props) => {
  return (
    <Modal isSmall isOpen={props.isOpen} onClose={props.onHandleClose} title="Cluster">
      <AddClusterForm />
    </Modal>
  );
}

export default connect(
  state => {
    return {
    };
  },
  dispatch => ({
    addCluster: values => dispatch(clusterOperations.addCluster(values)),
    updateCluster: values => dispatch(clusterOperations.updateCluster(values)),
  })
)(AddEditClusterModal);
