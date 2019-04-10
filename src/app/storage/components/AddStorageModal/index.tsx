import React from 'react';
import { connect } from 'react-redux';
import Modal from '../../../common/ModalWrapper';
import AddStorageForm from './AddStorageForm';
import { storageOperations } from '../../duck';

class AddStorageModal extends React.Component<any, any> {
  render() {
    const { trigger, onHandleModalToggle, addStorage } = this.props;
    return (
      <Modal
        onClose={onHandleModalToggle}
        title="Add Storage"
        trigger={trigger}
      >
        <AddStorageForm onHandleModalToggle={onHandleModalToggle} onAddItemSubmit={addStorage}  />
      </Modal>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    addStorage: values => dispatch(storageOperations.addStorage(values)),
  }),
)(AddStorageModal);
