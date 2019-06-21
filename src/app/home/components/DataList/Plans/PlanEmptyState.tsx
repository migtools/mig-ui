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
          <Title size="lg">No currently started plans</Title>
        </EmptyState>
      </Box>
    </Flex>
  );
};

export default PlanEmptyState;
