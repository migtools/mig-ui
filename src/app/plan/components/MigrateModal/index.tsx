import React from 'react';
import { connect } from 'react-redux';
import Modal from '../../../common/ModalWrapper';
import MigrateModalForm from './MigrateModalForm';

class MigrateModal extends React.Component<any, any> {
  handleSubmit = () => {
    console.log('handling migrate modal submit...');
  }

  render() {
    const {
      trigger,
      onHandleModalToggle,
      planName,
    } = this.props;

    return (
      <Modal
        onClose={onHandleModalToggle}
        title={`Migrate ${planName}`}
        trigger={trigger}
        form={
          <MigrateModalForm onHandleModalToggle={onHandleModalToggle} onSubmit={this.handleSubmit} />}
      />
    );
  }
}

export default connect(
  state => {},
  dispatch => ({
  }),
)(MigrateModal);
