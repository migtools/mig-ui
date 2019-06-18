import React from 'react';
import { Progress, ProgressSize } from '@patternfly/react-core';

const PlanStatus = ({ plan, ...props }) => {
  const getStatus = () => {
    let status = null;
    if (plan.Migrations.length > 0) {
      //latest mig status logic
      if (plan.Migrations[0].status) {
        const migPhase = plan.Migrations[0].status.phase;
        switch (migPhase) {
          case 'Completed':
            status = 'Completed';
            break;
          case 'BackupStarted':
            status = 'Backup Started';
            break;
          case 'WaitOnBackupReplication':
            status = 'Waiting';
            break;
          case 'RestoreStarted':
            status = 'Restore Started';
            break;
          default:
            status = 'Unknown status';
            break;
        }
      }
    } else {
      if (plan.MigPlan.status) {
        const criticalConditions = plan.MigPlan.status.conditions.filter(
          (condition, i) => condition.category === 'Critical'
        );
        if (criticalConditions.length > 0) {
          return (status = criticalConditions[0].message);
        } else status = 'Ready';
      }
      //plan status logic
    }
    return status;
  };
  return (
    <div>
      <div>{getStatus()}</div>
      {/* <Progress value={plan.status.progress} title="" size={ProgressSize.sm} /> */}
    </div>
  );
  // const printState =
  //   plan.status.state === 'Not Started' ||
  //   plan.status.state === 'Staged Successfully' ||
  //   plan.status.state === 'Migrated Successfully';

  // const printStateAndProgress =
  //   plan.status.state === 'Staging' || plan.status.state === 'Migrating';
  // if (printState) {
  //   return <span>{plan.status.status}</span>;
  // } else if (printStateAndProgress) {
  //   return (
  //     <div>
  //       <div>{plan.status.status}</div>
  //       <Progress value={plan.status.progress} title="" size={ProgressSize.sm} />
  //     </div>
  //   );
  // } else {
  //   return null;
  // }
};

export default PlanStatus;
