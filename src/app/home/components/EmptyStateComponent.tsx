import React, { Component } from 'react';
import { Flex, Box } from '@rebass/emotion';
import theme from '../../../theme';
import {
  Button,
  Title,
  EmptyState,
  EmptyStateIcon,
} from '@patternfly/react-core';
import AddClusterModal from '../../cluster/components/AddClusterModal';
import { AddCircleOIcon } from '@patternfly/react-icons';
interface IState {
  isOpen: boolean;
}

class EmptyStateComponent extends Component<{}, IState> {
  state = {
    isOpen: false,
  };

  handleModalToggle = () => {
    this.setState(({ isOpen }) => ({
      isOpen: !isOpen,
    }));
  }

  render() {
    return (
      <React.Fragment>
        <EmptyState>
          <EmptyStateIcon icon={AddCircleOIcon} />
          <Title size="lg">
            Add source and target clusters for the migration
          </Title>
          <AddClusterModal
            trigger={<Button variant="primary">
              Add Cluster
            </Button>}
          />
        </EmptyState>
      </React.Fragment>
    );
  }
}

export default EmptyStateComponent;
