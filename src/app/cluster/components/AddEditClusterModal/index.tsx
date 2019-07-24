import React from 'react';
import { connect } from 'react-redux';
import AddClusterForm from './AddClusterForm';
import { clusterOperations } from '../../duck';
import { Modal } from '@patternfly/react-core';

class AddEditClusterModal extends React.Component<any, any> {
  render() {
    return (
      <Modal isSmall isOpen={this.props.isOpen} onClose={this.props.onHandleClose} title="Cluster">
        <AddClusterForm />
      </Modal>
    );
  }
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
