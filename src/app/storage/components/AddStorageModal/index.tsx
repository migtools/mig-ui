import React from 'react';
import { connect } from 'react-redux';
import AddStorageForm from './AddStorageForm';
import { storageOperations } from '../../duck';
import { Creators } from '../../duck/actions';
import ConnectionState from '../../../common/connection_state';
import { Modal } from '@patternfly/react-core';

class AddStorageModal extends React.Component<any, any> {
  componentDidMount() {
    this.props.resetConnectionState();
  }
  handleClose = () => {
    this.props.onHandleClose();
    this.props.resetConnectionState();
  }

  handleAdd = (vals) => {
    this.props.addStorage(vals);
  }

  render() {
    const {
      connectionState,
      checkConnection,
    } = this.props;

    return (
      <Modal
        isSmall
        isOpen={this.props.isOpen}
        onClose={this.handleClose}
        title="Add Storage"
      >
        <AddStorageForm
          connectionState={connectionState}
          onHandleModalToggle={this.handleClose}
          onAddItemSubmit={this.handleAdd}
          checkConnection={checkConnection}
        />
      </Modal>
    );
  }
}

export default connect(
  state => {
    return {
      connectionState: state.storage.connectionState,
    };
  },
  dispatch => ({
    addStorage: values => dispatch(storageOperations.addStorage(values)),
    checkConnection: () => dispatch(storageOperations.checkConnection()),
    resetConnectionState: () => dispatch(Creators.setConnectionState(ConnectionState.Pending)),
  }),
)(AddStorageModal);
