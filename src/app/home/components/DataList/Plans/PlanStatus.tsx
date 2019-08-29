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
    hasSucceededStage,
    latestType,
    latestIsFailed,
  } = plan.PlanStatus;

  const getStatus = () => {
    const status = { text: 'Waiting for status...' };

    if(latestIsFailed) {
      status.text = `${latestType} Failed`;
    } else if (hasClosedCondition) {
      status.text = 'Closed';
    } else if (isClosing) {
      status.text = 'Closing';
    } else if (hasSucceededStage) {
      status.text = `Stage Succeeded`;
    } else if (hasSucceededMigration) {
      status.text = `Migration Succeeded`;
    } else if (hasRunningMigrations) {
      status.text = `${latestType} Running`;
    } else if (hasNotReadyCondition || !hasReadyCondition) {
      status.text = 'Not Ready';
    } else if (hasReadyCondition) {
      status.text = "Ready";
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
