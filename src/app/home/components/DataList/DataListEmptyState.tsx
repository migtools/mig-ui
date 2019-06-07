import React, { Component, useState } from 'react';
import { Button, Title, EmptyState, EmptyStateIcon } from '@patternfly/react-core';
import AddClusterModal from '../../../cluster/components/AddClusterModal';
import AddStorageModal from '../../../storage/components/AddStorageModal';
import WizardContainer from '../../../plan/components/Wizard/WizardContainer';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { useOpenModal } from '../../duck/hooks';

interface IEmptyStateProps {
  clusterList?: any;
  onPlanSubmit?: () => void;
  storageList?: any;
  isLoading?: boolean;
  plansDisabled?: boolean;
  type: string;
}

const DataListEmptyState: React.FunctionComponent<IEmptyStateProps> = ({
  clusterList,
  storageList,
  isLoading,
  onPlanSubmit,
  ...props
}) => {
  const [isOpen, toggleOpen] = useState(false);

  const { plansDisabled } = props;
  const renderPlanAdd = () => {
    return (
      <React.Fragment>
        <Title size="lg">Add a migration plan</Title>
        <Button isDisabled={plansDisabled} onClick={() => toggleOpen(!isOpen)} variant="primary">
          Add Plan
        </Button>
        <WizardContainer
          clusterList={clusterList}
          storageList={storageList}
          isOpen={isOpen}
          onHandleClose={toggleOpen}
          isLoading={isLoading}
          onPlanSubmit={onPlanSubmit}
        />
      </React.Fragment>
    );
  };
  const renderStorageAdd = () => {
    return (
      <React.Fragment>
        <Title size="lg">Add replication repositories for the migration</Title>
        <Button onClick={() => toggleOpen(!isOpen)} variant="primary">
          Add Repository
        </Button>
        <AddStorageModal isOpen={isOpen} onHandleClose={toggleOpen} />
      </React.Fragment>
    );
  };
  const renderClusterAdd = () => {
    return (
      <React.Fragment>
        <Title size="lg">Add source and target clusters for the migration</Title>
        <Button onClick={() => toggleOpen(!isOpen)} variant="primary">
          Add Cluster
        </Button>
        <AddClusterModal isOpen={isOpen} onHandleClose={toggleOpen} />
      </React.Fragment>
    );
  };
  return (
    <React.Fragment>
      <EmptyState variant="large">
        <EmptyStateIcon icon={AddCircleOIcon} />
        {props.type === 'cluster' && renderClusterAdd()}
        {props.type === 'storage' && renderStorageAdd()}
        {props.type === 'plan' && renderPlanAdd()}
      </EmptyState>
    </React.Fragment>
  );
};

export default DataListEmptyState;
