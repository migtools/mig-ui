import React from 'react';
import { connect } from 'react-redux';
import Modal from '../../../common/ModalWrapper';
import AddClusterForm from './AddClusterForm';
import { clusterOperations } from '../../duck';

class AddClusterModal extends React.Component<any, any> {
  render() {
    const { trigger, onHandleModalToggle, addCluster } = this.props;
    return (
      <Modal
        onClose={onHandleModalToggle}
        title="Add Cluster"
        trigger={trigger}
        form={
          <AddClusterForm onHandleModalToggle={onHandleModalToggle} onAddItemSubmit={addCluster} />}
      />
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    addCluster: values => dispatch(clusterOperations.addCluster(values)),
  }),
)(AddClusterModal);
