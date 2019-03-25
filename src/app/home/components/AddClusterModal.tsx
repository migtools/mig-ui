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
import { PlusCircleIcon } from '@patternfly/react-icons';

interface IState {
  isModalOpen?: boolean;
}

class AddClusterModal extends React.Component<{}, IState> {

  state = {
    isModalOpen: false,
  };

  onHandleModalToggle = () => {
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen,
    }));
  }

  render() {
    const { isModalOpen } = this.state;
    return (
      <React.Fragment>
        <Button variant="link" onClick={this.onHandleModalToggle}>
          <PlusCircleIcon /> Add clusters
        </Button>
        <Modal
          isOpen={isModalOpen}
          onClose={this.onHandleModalToggle}
          title="Add Cluster"
          actions={[
            <Button key="cancel" variant="secondary" onClick={this.onHandleModalToggle}>
              Cancel
            </Button>,
            <Button key="confirm" variant="secondary" onClick={this.onHandleModalToggle}>
              Add
            </Button>,
          ]}
        >
          <TextContent>
            <TextList component="dl">
              <TextListItem component="dt">Cluster URL</TextListItem>
              <TextInput type="text" aria-label="text input example" />
              <TextListItem component="dt">Service account token</TextListItem>
              <TextArea aria-label="text area example" />
            </TextList>
          </TextContent>
        </Modal>
      </React.Fragment>
    );
  }
}

export default AddClusterModal;
