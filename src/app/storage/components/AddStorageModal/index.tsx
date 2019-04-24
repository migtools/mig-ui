import React from 'react';
import { connect } from 'react-redux';
import Modal from '../../../common/ModalWrapper';
import AddStorageForm from './AddStorageForm';
import { storageOperations } from '../../duck';
import { Creators } from '../../duck/actions';
import ConnectionState from '../../../common/connection_state';

class AddStorageModal extends React.Component<any, any> {
  componentDidMount() {
    this.props.resetConnectionState();
  }

  render() {
    const {
      trigger,
      addStorage,
      connectionState,
      checkConnection,
      onToggle,
    } = this.props;

    const onCloseHook = () => {
      this.props.resetConnectionState();
    };

    const onAddHook = (vals) => {
      addStorage(vals);
      onToggle();
    }

    return (
      <Modal
        onClose={onCloseHook}
        title="Add Storage"
        trigger={trigger}
        form={
          <AddStorageForm
            onHandleModalToggle={onCloseHook}
            onAddItemSubmit={onAddHook}
            connectionState={connectionState}
            checkConnection={checkConnection}
          />}
      />
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
