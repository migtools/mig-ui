import React from 'react';
import { connect } from 'react-redux';
import { Modal } from '@patternfly/react-core';
import MigrateModalForm from './MigrateModalForm';
import planOperations from '../../duck/operations';

const MigrateModal = ({ runMigration, onHandleClose, isOpen, plan }) => {
  const handleSubmit = () => {
    runMigration(plan);
  };
  const handleClose = () => {
    onHandleClose();
  };

  return (
    <Modal
      isSmall
      isOpen={isOpen}
      onClose={handleClose}
      title={`Migrate ${plan.MigPlan.metadata.name}`}
    >
      <MigrateModalForm onHandleModalToggle={handleClose} handleSubmit={handleSubmit} />
    </Modal>
  );
};

const mapDispatchToProps = dispatch => {
  return {
    runMigration: plan => dispatch(planOperations.runMigration(plan)),
  };
};

export default connect(
  null,
  mapDispatchToProps
)(MigrateModal);
