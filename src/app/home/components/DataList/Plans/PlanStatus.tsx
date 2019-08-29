import React from 'react';

interface IProps {
  isDeleting: boolean;
  plan: any;
}

const PlanStatus: React.FunctionComponent<IProps> = ({ plan, isDeleting }) => {
  const {
    hasClosedCondition,
    hasReadyCondition,
    hasNotReadyCondition,
    hasRunningMigrations,
    hasSucceededMigration,
    hasSucceededStage,
    latestType,
    latestIsFailed,
  } = plan.PlanStatus;

  const getStatus = () => {
    const status = { text: 'Waiting for status...' };

    if(latestIsFailed) {
      status.text = `${latestType} Failed`;
    } else if (isDeleting) {
      status.text = 'Deleting';
    } else if (hasClosedCondition) {
      status.text = 'Closed';
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

    return status;
  };
  return (
    <div>
      <div>{getStatus().text}</div>
    </div>
  );
};

export default PlanStatus;
