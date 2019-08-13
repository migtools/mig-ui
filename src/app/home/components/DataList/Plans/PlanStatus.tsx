import React from 'react';

const PlanStatus = ({ plan }) => {
  const {
    hasClosedCondition,
    hasReadyCondition,
    hasNotReadyCondition,
    hasRunningMigrations,
    hasSucceededMigration,
    finalMigrationComplete,
    hasSucceededStage,
    hasPrevMigrations,
    hasMigrationError,
    hasStageError,
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
    if (hasClosedCondition) {
      status.text = 'Closed';
    }
    if (hasRunningMigrations) {
      status.text = `${latestType} Running`;
    }
    if (hasMigrationError) {
      status.text = 'Migration Failed';
    }
    if (hasStageError) {
      status.text = 'Stage Failed';
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
