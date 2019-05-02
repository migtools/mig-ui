import React from 'react';
import { connect } from 'react-redux';
import { Modal } from '@patternfly/react-core';
import MigrateModalForm from './MigrateModalForm';
import planOperations from '../../duck/operations';

class MigrateModal extends React.Component<any, any> {
  handleSubmit = () => {
    this.props.runMigration(this.props.plan);
  }
  handleClose = () => {
    this.props.onHandleClose();
  }

  render() {
    const {
      plan,
    } = this.props;

    return (
      <Modal
        isSmall
        isOpen={this.props.isOpen}
        onClose={this.handleClose}
        title={`Migrate ${plan.planName}`}
      >
        <MigrateModalForm
          onHandleModalToggle={this.handleClose}
          handleSubmit={this.handleSubmit}
        />
      </Modal>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    runMigration: plan => dispatch(planOperations.runMigration(plan)),
  };
};

export default connect(null, mapDispatchToProps)(MigrateModal);
