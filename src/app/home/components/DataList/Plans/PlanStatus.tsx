import React from 'react';
import { Progress, ProgressSize } from '@patternfly/react-core';

const PlanStatus = ({ plan, ...props }) => {
  const getStatus = () => {
    const status = { text: 'Waiting for status...', progress: null };
    let hasReadyCondition = null;
    let hasErrorCondition = null;
    let hasRunningMigrations = null;
    let hasSucceededMigration = null;
    let hasPrevMigrations = null;
    let hasClosedCondition = null;
    if (plan.MigPlan.status) {
      hasClosedCondition = !!plan.MigPlan.spec.closed;
      hasReadyCondition = !!plan.MigPlan.status.conditions.filter(c => c.type === 'Ready').length;
      hasErrorCondition = !!plan.MigPlan.status.conditions.filter(c => c.category === 'Critical')
        .length;
      if (plan.Migrations.length > 0) {
        hasPrevMigrations = !!plan.Migrations.length;
        hasRunningMigrations = !!plan.Migrations.filter(m => {
          if (m.status) {
            return m.status.conditions.some(c => c.type === 'Running');
          }
        }).length;

        hasSucceededMigration = !!plan.Migrations.filter(m => {
          if (m.status) {
            return m.status.conditions.some(c => c.type === 'Succeeded');
          }
        }).length;
      }

      if (hasErrorCondition || !hasReadyCondition) {
        status.text = 'Not Ready';
      }
      if (hasReadyCondition || !hasPrevMigrations) {
        status.text = 'Ready';
      }
      if (hasRunningMigrations) {
        status.text = 'Running';
      }
      if (hasSucceededMigration) {
        status.text = 'Succeeded';
      }
      if (hasClosedCondition) {
        status.text = 'Closed';
      }
    }
    return status;
  };
  return (
    <div>
      <div>{getStatus().text}</div>
      {getStatus().progress && (
        <Progress value={getStatus().progress} title="" size={ProgressSize.sm} />
      )}
    </div>
  );
};

export default PlanStatus;
