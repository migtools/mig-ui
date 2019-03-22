import React from 'react';
import { Modal } from '@patternfly/react-core';
import AddClusterForm from './AddClusterForm';

interface IProps {
  onHandleModalToggle: () => void;
  isOpen?: boolean;
}

const AddClusterModal: React.SFC<any> = ({
  onHandleModalToggle,
  onAddClusterSubmit,
  isOpen,
  ...props
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onHandleModalToggle} title="Add Cluster">
      <AddClusterForm
        onAddClusterSubmit={onAddClusterSubmit}
        onHandleModalToggle={onHandleModalToggle}
        {...props}
      />
    </Modal>
  );
};

export default AddClusterModal;
