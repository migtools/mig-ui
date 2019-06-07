/** @jsx jsx */
import React from 'react';
import { Button, Modal } from '@patternfly/react-core';
import { jsx } from '@emotion/core';

interface IProps {
  onHandleClose: (isConfirmed) => void;
  id: string;
  message: string;
  isOpen: boolean;
}

const ConfirmModal: React.FunctionComponent<IProps> = ({ isOpen, onHandleClose, message, id }) => {
  return (
    <Modal
      id={id}
      isSmall
      title="Confirmation"
      isOpen={isOpen}
      onClose={onHandleClose}
      actions={[
        <Button key="cancel" variant="secondary" onClick={() => onHandleClose(false)}>
          Cancel
        </Button>,
        <Button key="confirm" variant="primary" onClick={() => onHandleClose(true)}>
          Confirm
        </Button>,
      ]}
    >
      {message}
    </Modal>
  );
};

export default ConfirmModal;
