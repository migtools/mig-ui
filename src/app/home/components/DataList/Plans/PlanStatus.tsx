import React from 'react';

interface IProps {
  isClosing?: any;
  plan: any;
}

const PlanStatus: React.FunctionComponent<IProps> = ({ plan, isClosing }) => {
  const {
    hasClosedCondition,
    hasReadyCondition,
    hasNotReadyCondition,
    hasRunningMigrations,
    hasSucceededMigration,
    finalMigrationComplete,
    hasSucceededStage,
    hasPrevMigrations,
    latestType,
    latestIsFailed,
  } = plan.PlanStatus;

  const getStatus = () => {
    const status = { text: 'Waiting for status...' };
    if (hasReadyCondition || !hasPrevMigrations) {
      status.text = 'Ready';
    }
    if (hasNotReadyCondition || !hasReadyCondition) {
      status.text = 'Not Ready';
    }
    if (hasSucceededStage) {
      status.text = `Stage Succeeded`;
    }
    if (hasSucceededMigration) {
      status.text = `Migration Succeeded`;
    }
    if (latestIsFailed) {
      status.text = `${latestType} Failed`;
    }
    if (hasRunningMigrations) {
      status.text = `${latestType} Running`;
    }
    if (hasClosedCondition) {
      status.text = 'Closed';
    }
    if (isClosing) {
      status.text = 'Closing';
    }
    return status;
  };
  return (
    <div>{getStatus().text}</div>
  );
};

export default PlanStatus;
