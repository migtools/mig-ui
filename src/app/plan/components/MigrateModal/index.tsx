import React from 'react';
import { connect } from 'react-redux';
import Modal from '../../../common/ModalWrapper';
import MigrateModalForm from './MigrateModalForm';
import planOperations from '../../duck/operations';

class MigrateModal extends React.Component<any, any> {
  handleSubmit = () => {
    this.props.runMigration(this.props.plan);
  }

  render() {
    const {
      trigger,
      onHandleModalToggle,
      plan,
    } = this.props;

    return (
      <Modal
        onClose={onHandleModalToggle}
        title={`Migrate ${plan.planName}`}
        trigger={trigger}
        form={
          <MigrateModalForm
            onHandleModalToggle={onHandleModalToggle}
            handleSubmit={this.handleSubmit}
          />
        }
      />
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    runMigration: plan => dispatch(planOperations.runMigration(plan)),
  };
};

export default connect(null, mapDispatchToProps)(MigrateModal);
