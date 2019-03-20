import React from 'react';
import {
  Modal,
  Button,
  TextInput,
  TextContent,
  TextList,
  TextListItem,
  TextArea,
} from '@patternfly/react-core';

interface IProps {
  onHandleModalToggle: () => void;
  isModalOpen?: boolean;
}

const AddClusterModal: React.SFC<IProps> = ({ onHandleModalToggle, isModalOpen, ...props }) => (
  <Modal
    isOpen={isModalOpen}
    onClose={onHandleModalToggle}
    title="Add Cluster"
  >
    <TextContent>
      <TextList component="dl">
        <TextListItem component="dt">Cluster URL</TextListItem>
        <TextInput type="text" aria-label="text input example" />
        <TextListItem component="dt">Service account token</TextListItem>
        <TextArea aria-label="text area example" />
        <Button key="cancel" variant="secondary" onClick={onHandleModalToggle}>
          Cancel
        </Button>
        <Button key="confirm" variant="secondary" onClick={onHandleModalToggle}>
          Add
        </Button>
      </TextList>
    </TextContent>
  </Modal>
);

export default AddClusterModal;
