import React from 'react';
import { connect } from 'react-redux';
import AddClusterForm from './AddClusterForm';
import { clusterOperations } from '../../duck';
import { Creators } from '../../duck/actions';
import { Modal } from '@patternfly/react-core';

class AddClusterModal extends React.Component<any, any> {
  handleClose = () => {
    this.props.onHandleClose();
    this.props.resetConnectionState();
  };

  handleAdd = vals => {
    this.props.addCluster(vals);
  };

  handleUpdate = vals => {
    console.log('handle update called');
    this.props.updateCluster(vals);
  };

  render() {
    const { isCheckingConnection, connectionState, name, url, token, mode } = this.props;

    return (
      <Modal isSmall isOpen={this.props.isOpen} onClose={this.handleClose} title="Cluster">
        <AddClusterForm
          connectionState={connectionState}
          isCheckingConnection={isCheckingConnection}
          onHandleModalToggle={this.handleClose}
          onItemSubmit={mode === 'update' ? this.handleUpdate : this.handleAdd}
          name={name}
          url={url}
          token={token}
          mode={mode}
        />
      </Modal>
    );
  }
}

export default connect(
  state => {
    return {
      connectionState: state.cluster.connectionState,
      isCheckingConnection: state.cluster.isCheckingConnection,
    };
  },
  dispatch => ({
    addCluster: values => dispatch(clusterOperations.addCluster(values)),
    updateCluster: values => dispatch(clusterOperations.updateCluster(values)),
    resetConnectionState: () => dispatch(Creators.resetConnectionState()),
  })
)(AddClusterModal);
