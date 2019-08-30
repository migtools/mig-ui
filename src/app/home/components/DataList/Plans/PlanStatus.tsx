import React from 'react';

interface IProps {
  plan: any;
}

const PlanStatus: React.FunctionComponent<IProps> = ({ plan }) => {
  const {
    hasClosedCondition,
    hasReadyCondition,
    hasNotReadyCondition,
    hasRunningMigrations,
    hasSucceededMigration,
    hasSucceededStage,
    latestType,
    latestIsFailed,
    hasConflictCondition,
    conflictErrorMsg,
    isPlanLocked
  } = plan.PlanStatus;

  const getStatus = () => {
    const status = { text: 'Waiting for status...' };
    if (latestIsFailed) {
      status.text = `${latestType} Failed`;
    } else if (hasClosedCondition) {
      status.text = 'Closed';
    } else if (hasConflictCondition) {
      status.text = conflictErrorMsg || 'Conflicting plan';
    } else if (hasRunningMigrations) {
      status.text = `${latestType} Running`;
    } else if (hasSucceededStage) {
      status.text = `Stage Succeeded`;
    } else if (hasSucceededMigration) {
      status.text = `Migration Succeeded`;
    } else if (hasNotReadyCondition || !hasReadyCondition) {
      status.text = 'Not Ready';
    } else if (hasReadyCondition) {
      status.text = 'Ready';
    }
    if (isPlanLocked) {
      status.text = 'Pending';
    }
    return status;
  };
  return (
    <div>
      <div>{getStatus().text}</div>
    </div>
  );
};

export default PlanStatus;
