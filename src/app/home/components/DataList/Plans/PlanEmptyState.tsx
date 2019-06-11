import React from 'react';
import { useOpenModal } from '../../../duck/hooks';
import WizardContainer from '../../../../plan/components/Wizard/WizardContainer';
import { Flex, Box } from '@rebass/emotion';
import { Button, Title, EmptyState, EmptyStateIcon } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';

const PlanEmptyState = ({ clusterList, storageList, onPlanSubmit, isLoading, plansDisabled }) => {
  const [isOpen, toggleOpen] = useOpenModal(false);
  return (
    <Flex alignItems="center" justifyContent="center">
      <Box>
        <EmptyState variant="large">
          <EmptyStateIcon icon={AddCircleOIcon} />
          <Title size="lg">Add a migration plan</Title>
          <Button isDisabled={plansDisabled} onClick={toggleOpen} variant="primary">
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
        </EmptyState>
      </Box>
    </Flex>
  );
};

export default PlanEmptyState;
