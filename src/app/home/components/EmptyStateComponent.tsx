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
import { useExpandDataList, useOpenModal } from '../duck/hooks';
import { PlusCircleIcon } from '@patternfly/react-icons';

const EmptyStateComponent = ({ ...props }) => {
  const [isExpanded, toggleExpanded] = useExpandDataList(false);
  const [isOpen, toggleOpen] = useOpenModal(false);

  const renderPlanAdd = () => {
    return (
      <React.Fragment>
        <Title size="lg">
          Add a migration plan
        </Title>
        <Button isDisabled={props.plansDisabled} onClick={toggleOpen} variant="primary">
          Add Plan
        </Button>

        <Wizard
          clusterList={props.clusterList}
          storageList={props.storageList}
          isOpen={isOpen}
          onHandleClose={toggleOpen}
          isLoading={props.isLoading}
          onPlanSubmit={props.onPlanSubmit}
        />

      </React.Fragment>
    );
  }
  const renderStorageAdd = () => {
    return (
      <React.Fragment>
        <Title size="lg">
          Add replication repositories for the migration
          </Title>
        <Button onClick={toggleOpen} variant="primary">
          Add Storage
            </Button>
        <AddStorageModal isOpen={isOpen} onHandleClose={toggleOpen} />
      </React.Fragment>

    );
  }
  const renderClusterAdd = () => {
    return (
      <React.Fragment>
        <Title size="lg">
          Add source and target clusters for the migration
          </Title>
        <Button onClick={toggleOpen} variant="primary">
          Add Cluster
            </Button>
        <AddClusterModal isOpen={isOpen} onHandleClose={toggleOpen} />
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <EmptyState variant="large">
        <EmptyStateIcon icon={AddCircleOIcon} />
        {props.type === 'cluster' &&
          renderClusterAdd()}
        {props.type === 'storage' &&
          renderStorageAdd()}
        {props.type === 'plan' &&
          renderPlanAdd()}
      </EmptyState>
    </React.Fragment>
  );
}

export default EmptyStateComponent;
