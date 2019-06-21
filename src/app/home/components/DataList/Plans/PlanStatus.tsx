import React from 'react';
import { Progress, ProgressSize } from '@patternfly/react-core';

const PlanStatus = ({ plan, ...props }) => {
  const getStatus = () => {
    const status = { text: 'Waiting for status...', progress: null };
    if (plan.Migrations.length > 0) {
      if (plan.Migrations[0].status) {
        const migPhase = plan.Migrations[0].status.phase;
        switch (migPhase) {
          case 'WaitOnResticRestart':
            status.text = 'Waiting';
            status.progress = 10;
            break;
          case 'BackupStarted':
            status.text = 'Backup started';
            status.progress = 40;
            break;

          case 'WaitOnBackupReplication':
            status.text = 'Waiting';
            status.progress = 50;
            break;
          case 'RestoreStarted':
            status.text = 'Restoring....';
            status.progress = 60;
            break;
          case 'Completed':
            status.text = 'Completed';
            status.progress = null;
            break;
          default:
            status.text = 'Something went wrong...';
            status.progress = null;
            break;
        }
      }
    } else {
      //plan status logic
      if (plan.MigPlan.status) {
        const criticalConditions = plan.MigPlan.status.conditions.filter(
          (condition, i) => condition.category === 'Critical'
        );
        if (criticalConditions.length > 0) {
          status.text = criticalConditions[0].message;
        } else {
          status.text = 'Ready';
        }
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
