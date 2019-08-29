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
    hasPrevMigrations,
    latestType,
    latestIsFailed,
    isDeleting
  } = plan.PlanStatus;

  const getStatus = () => {
    const status = { text: 'Waiting for status...' };
    if (isDeleting) {
      status.text = 'Deleting';
      return status;
    }
    if (hasReadyCondition || !hasPrevMigrations) {
      status.text = 'Ready';
      return status;
    }
    if (hasNotReadyCondition || !hasReadyCondition) {
      status.text = 'Not Ready';
      return status;
    }
    if (hasSucceededStage) {
      status.text = `Stage Succeeded`;
      return status;
    }
    if (hasSucceededMigration) {
      status.text = `Migration Succeeded`;
      return status;
    }
    if (latestIsFailed) {
      status.text = `${latestType} Failed`;
      return status;
    }
    if (hasRunningMigrations) {
      status.text = `${latestType} Running`;
      return status;
    }
    if (hasClosedCondition) {
      status.text = 'Closed';
      return status;
    }
  };
  return (
    <div>
      <div>{getStatus().text}</div>
    </div>
  );
};

export default PlanStatus;
