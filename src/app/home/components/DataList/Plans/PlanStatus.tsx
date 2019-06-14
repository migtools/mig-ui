import React from 'react';
import { Progress, ProgressSize } from '@patternfly/react-core';

const PlanStatus = ({ plan, ...props }) => {
  const printState =
    plan.status.state === 'Not Started' ||
    plan.status.state === 'Staged Successfully' ||
    plan.status.state === 'Migrated Successfully';

  const printStateAndProgress =
    plan.status.state === 'Staging' || plan.status.state === 'Migrating';
  if (printState) {
    return <span>{plan.status.status}</span>;
  } else if (printStateAndProgress) {
    return (
      <div>
        <div>{plan.status.status}</div>
        <Progress value={plan.status.progress} title="" size={ProgressSize.sm} />
      </div>
    );
  } else {
    return null;
  }
};

export default PlanStatus;
