import React, { Component } from 'react';
import {
  Progress, ProgressSize,
} from '@patternfly/react-core';

const PlanStatus = ({ plan, ...props }) => {
  const printState =
    plan.status.state === 'Not Started' ||
    plan.status.state === 'Staged Successfully' ||
    plan.status.state === 'Migrated Successfully';

  const printStateAndProgress =
    plan.status.state === 'Staging' ||
    plan.status.state === 'Migrating';
  if (printState) {
    return (
      <span>{plan.status.state}</span>
    );
  } else if (printStateAndProgress) {
    return (
      <div>
        <div>{plan.status.state}</div>
        <Progress value={plan.status.progress} title="" size={ProgressSize.sm} />
      </div>
    );
  } else {
    return null;
  }
};

export default PlanStatus;
