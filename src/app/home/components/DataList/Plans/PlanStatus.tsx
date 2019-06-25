import React from 'react';

const PlanStatus = ({ plan, ...props }) => {
  const getStatus = () => {
    const status = { text: 'Waiting for status...' };
    let hasReadyCondition = null;
    let hasErrorCondition = null;
    let hasRunningMigrations = null;
    let hasSucceededMigration = null;
    let hasSucceededStage = null;
    let hasPrevMigrations = null;
    let hasClosedCondition = null;
    let latestType = null;
    if (plan.MigPlan.status) {
      hasClosedCondition = !!plan.MigPlan.spec.closed;
      hasReadyCondition = !!plan.MigPlan.status.conditions.filter(c => c.type === 'Ready').length;
      hasErrorCondition = !!plan.MigPlan.status.conditions.filter(c => c.category === 'Critical')
        .length;
      if (plan.Migrations.length > 0) {
        latestType = plan.Migrations[0].spec.stage ? 'Stage' : 'Migration';
        hasPrevMigrations = !!plan.Migrations.length;
        hasRunningMigrations = !!plan.Migrations.filter(m => {
          if (m.status) {
            return m.status.conditions.some(c => c.type === 'Running');
          }
        }).length;

        hasSucceededMigration = !!plan.Migrations.filter(m => {
          if (m.status && !m.spec.stage) {
            return m.status.conditions.some(c => c.type === 'Succeeded');
          }
        }).length;
        hasSucceededStage = !!plan.Migrations.filter(m => {
          if (m.status && m.spec.stage) {
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
        status.text = `${latestType} Running`;
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
