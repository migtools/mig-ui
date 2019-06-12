import React from 'react';
import { connect } from 'react-redux';
import AddClusterForm from './AddClusterForm';
import { clusterOperations } from '../../duck';
import { Creators } from '../../duck/actions';
import ConnectionState from '../../../common/connection_state';
import { Modal } from '@patternfly/react-core';

class AddClusterModal extends React.Component<any, any> {
  componentDidMount() {
    this.props.resetConnectionState();
  }
  handleClose = () => {
    this.props.onHandleClose();
    this.props.resetConnectionState();
  };

  handleAdd = vals => {
    this.props.addCluster(vals);
  };

  handleUpdate = vals => {
    this.props.updateCluster(vals);
  }

  render() {
    const { checkConnection, connectionState, name, url, token, mode } = this.props;

    return (
      <Modal isSmall isOpen={this.props.isOpen} onClose={this.handleClose} title="Cluster">
        <AddClusterForm
          connectionState={connectionState}
          onHandleModalToggle={this.handleClose}
          onItemSubmit={ (mode === 'update') ? this.handleUpdate : this.handleAdd}
          checkConnection={checkConnection}
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
    };
  },
  dispatch => ({
    checkConnection: () => dispatch(clusterOperations.checkConnection()),
    addCluster: values => dispatch(clusterOperations.addCluster(values)),
    updateCluster: values => dispatch(clusterOperations.updateCluster(values)),
    resetConnectionState: () => dispatch(Creators.setConnectionState(ConnectionState.Pending)),
  })
)(AddClusterModal);
