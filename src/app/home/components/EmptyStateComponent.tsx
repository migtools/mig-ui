import React, { Component } from "react";
import { Flex, Box } from "@rebass/emotion";
import theme from "../../../theme";
import {
  Button,
  Title,
  EmptyState,
  EmptyStateIcon
} from "@patternfly/react-core";
import DynamicModal from "../../common/DynamicModalComponent";
import { AddCircleOIcon } from "@patternfly/react-icons";
interface IState {
  isOpen: boolean;
}
interface IProps {}

class EmptyStateComponent extends Component<IProps, IState> {
  state = {
    isOpen: false
  };

  handleModalToggle = () => {
    this.setState(({ isOpen }) => ({
      isOpen: !isOpen
    }));
  };

  render() {
    return (
      <React.Fragment>
        <EmptyState>
          <EmptyStateIcon icon={AddCircleOIcon} />
          <Title size="lg">
            Add source and target clusters for the migration
          </Title>
          <Button variant="primary" onClick={this.handleModalToggle}>
            Add Cluster
          </Button>
        </EmptyState>
        <DynamicModal
          onHandleModalToggle={this.handleModalToggle}
          isOpen={this.state.isOpen}
          modalType="cluster"
        />
      </React.Fragment>
    );
  }
}

export default EmptyStateComponent;
