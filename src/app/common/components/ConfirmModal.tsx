import React from 'react';
import { Button, Modal } from '@patternfly/react-core';

interface IProps {
  onHandleClose: (isConfirmed: boolean) => void;
  id: string;
  title: string;
  message: string;
  isOpen: boolean;
}

const ConfirmModal: React.FunctionComponent<IProps> = ({
  isOpen,
  onHandleClose,
  title,
  message,
  id,
}) => {
  return (
    <Modal
      id={id}
      variant="small"
      title={title}
      isOpen={isOpen}
      onClose={() => onHandleClose(false)}
      actions={[
        <Button key="confirm" variant="primary" onClick={() => onHandleClose(true)}>
          Confirm
        </Button>,
        <Button key="cancel" variant="secondary" onClick={() => onHandleClose(false)}>
          Cancel
        </Button>,
      ]}
    >
      {message}
    </Modal>
  );
};

export default ConfirmModal;
