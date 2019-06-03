/** @jsx jsx */
import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal } from '@patternfly/react-core';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import theme from '../../../theme';
import { useOpenModal } from '../duck/hooks';

interface IProps {
  onHandleClose: (isConfirmed) => void;
  id: string;
  message: string;
  isOpen: boolean;
}

const ConfirmModal: React.FunctionComponent<IProps> = ({
  isOpen,
  onHandleClose,
  message,
  id,
  ...rest
}) => {
  return (
    <Modal
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
