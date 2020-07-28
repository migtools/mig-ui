import { IPlan, IMigPlan, IMigration, ICondition, IStatus } from '../../plan/duck/types';
interface IPlanConditionStatuses {
  hasClosedCondition: boolean;
  hasReadyCondition: boolean;
  hasNotReadyCondition: boolean;
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
  hasAttemptedMigration: boolean;
  finalMigrationComplete: boolean;
}

export const filterPlanConditions = (conditions: ICondition[]): IPlanConditionStatuses => ({
  hasClosedCondition: conditions.some((c) => c.type === 'Closed'),
  hasReadyCondition: conditions.some((c) => c.type === 'Ready'),
  hasNotReadyCondition: conditions.some((c) => c.category === 'Critical'),
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
  hasSucceededStage: type === 'Stage' && conditions.some((c) => c.type === 'Succeeded'),
  hasSucceededMigration: type === 'Migration' && conditions.some((c) => c.type === 'Succeeded'),
  hasAttemptedMigration: type === 'Migration',
  finalMigrationComplete: type === 'Migration' && conditions.some((c) => c.type === 'Succeeded'),
});
