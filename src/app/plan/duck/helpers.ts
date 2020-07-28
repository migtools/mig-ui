import { IPlan, IMigPlan, IMigration, ICondition, IStatus } from '../../plan/duck/types';
interface IPlanConditionStatuses {
  hasClosedCondition: boolean;
  hasReadyCondition: boolean;
  hasPlanError: boolean;
  hasConflictCondition: boolean;
  conflictErrorMsg: string;
  hasPODWarnCondition: boolean;
  hasPVWarnCondition: boolean;
}

interface IMigrationConditionStatuses {
    latestIsFailed: boolean;
    hasCancelingCondition: boolean;
    hasCanceledCondition: boolean;
    hasSucceededStage: boolean;
    hasSucceededMigration: boolean;
}

export const filterPlanConditions = (conditions: ICondition[]): IPlanConditionStatuses => ({
  hasClosedCondition: conditions.some((c) => c.type === 'Closed'),
  hasReadyCondition: conditions.some((c) => c.type === 'Ready'),
  hasPlanError: conditions.some((c) => c.category === 'Critical'),
  hasConflictCondition: conditions.some((c) => c.type === 'PlanConflict'),
  hasPODWarnCondition: conditions.some((c) => c.type === 'PodLimitExceeded'),
  hasPVWarnCondition: conditions.some((c) => c.type === 'PVLimitExceeded'),
  conflictErrorMsg: conditions.find((c) => c.type === 'PlanConflict')?.message,
});

export const filterMigrationConditions = (
  conditions: ICondition[],
  type: string
): IMigrationConditionStatuses => ({
  latestIsFailed: conditions.some((c) => c.type === 'Failed'),
  hasCancelingCondition: conditions.some((c) => c.type === 'Canceling'),
  hasCanceledCondition: conditions.some((c) => c.type === 'Canceled'),
  hasSucceededStage:
    type === 'Stage' && conditions.some((c) => (c.type === 'Succeeded' || c.type !== 'Canceled')),
  hasSucceededMigration:
    type === 'Migration' && conditions.some((c) => (c.type === 'Succeeded' || c.type !== 'Canceled'),
  hasClosedCondition: conditions.someLogicHere(),
  hasReadyCondition: conditions.someLogicHere(),
  hasPlanError: conditions.someLogicHere(),
  hasConflictCondition: conditions.someLogicHere(),
  hasPODWarnCondition: conditions.someLogicHere(),
  hasPVWarnCondition: conditions.someLogicHere(),
  conflictErrorMsg: conditions.someLogicHere(),
});

//     }

//     hasSucceededMigration = !!plan.Migrations.filter((m) => {
//       if (m.status && !m.spec.stage) {
//         return (
//           m.status.conditions.some((c) => c.type === 'Succeeded') &&
//           !latest.status.conditions.some((c) => c.type === 'Canceled')
//         );
//       }
//     }).length;

//     hasAttemptedMigration = !!plan.Migrations.some((m) => !m.spec.stage);

//     finalMigrationComplete = !!plan.Migrations.filter((m) => {
//       if (m.status) {
//         return m.spec.stage === false && hasSucceededMigration;
//       }
//     }).length;

//     hasRunningMigrations = !!plan.Migrations.filter((m) => {
//       if (m.status) {
//         return m.status.conditions.some((c) => c.type === 'Running');
//       }
//     }).length;
//   }
