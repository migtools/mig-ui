import React from 'react';
import { Button, Title, EmptyState, EmptyStateIcon } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';

const PlanEmptyState = ({ toggleOpen, addPlanDisabledObj }) => {
  return (
    <EmptyState variant="full">
      <EmptyStateIcon icon={AddCircleOIcon} />
      <Title size="lg">No migration plans exist</Title>
      <Button isDisabled={addPlanDisabledObj.isPlanDisabled} onClick={toggleOpen} variant="primary">
        Add plan
      </Button>
    </EmptyState>
  );
};

export default PlanEmptyState;
