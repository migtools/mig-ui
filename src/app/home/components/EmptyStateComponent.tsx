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
import AddStorageModal from '../../storage/components/AddStorageModal';
import Wizard from '../../plan/components/Wizard';
import { AddCircleOIcon } from '@patternfly/react-icons';
interface IState {
  isOpen: boolean;
}
interface IProps {
  type?: string;
  onWizardToggle?: () => void;
}

class EmptyStateComponent extends Component<IProps, IState> {
  state = {
    isOpen: false,
  };

  handleModalToggle = () => {
    this.setState(({ isOpen }) => ({
      isOpen: !isOpen,
    }));
  }
  renderPlanAdd() {
    return (
      <React.Fragment>
        <Title size="lg">
          Start a migration plan
          </Title>
        <Button onClick={this.props.onWizardToggle} variant="primary">
          Start Plan
        </Button>

      </React.Fragment>

    );
  }
  renderStorageAdd() {
    return (
      <React.Fragment>
        <Title size="lg">
          Add replication repositories for the migration
          </Title>
        <AddStorageModal
          trigger={<Button variant="primary">
            Add Storage
            </Button>}
        />

      </React.Fragment>

    );
  }
  renderClusterAdd() {
    return (
      <React.Fragment>
        <Title size="lg">
          Add source and target clusters for the migration
          </Title>
        <AddClusterModal
          trigger={<Button variant="primary">
            Add Cluster
            </Button>}
        />

      </React.Fragment>

    );
  }
  render() {
    const { type } = this.props;
    return (
      <React.Fragment>
        <EmptyState>
          <EmptyStateIcon icon={AddCircleOIcon} />
          {type === 'cluster' &&
            this.renderClusterAdd()}
          {type === 'storage' &&
            this.renderStorageAdd()}
          {type === 'plan' &&
            this.renderPlanAdd()}
        </EmptyState>
      </React.Fragment>
    );
  }
}

export default EmptyStateComponent;
