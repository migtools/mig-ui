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

interface ILatestMigrationConditionStatuses {
  latestIsFailed: boolean;
  hasCancelingCondition: boolean;
  hasCanceledCondition: boolean;
  hasCriticalCondition: boolean;
  hasWarnCondition: boolean;
  hasDVMBlockedCondition: boolean;
}
interface ILatestAnalyticConditionStatuses {
  latestAnalyticTransitionTime: string;
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

export const filterLatestMigrationConditions = (
  conditions: ICondition[]
): ILatestMigrationConditionStatuses => ({
  latestIsFailed: conditions.some((c) => c.type === 'Failed'),
  hasCriticalCondition: conditions.some((c) => c.category === 'Critical'),
  hasCancelingCondition: conditions.some((c) => c.type === 'Canceling'),
  hasCanceledCondition: conditions.some((c) => c.type === 'Canceled'),
  hasWarnCondition: conditions.some((c) => c.category === 'Warn'),
  hasDVMBlockedCondition: conditions.some((c) => c.type === 'DirectVolumeMigrationBlocked'),
});

export const filterLatestAnalyticConditions = (
  conditions: ICondition[]
): ILatestAnalyticConditionStatuses => ({
  latestAnalyticTransitionTime:
    conditions.find((c) => c.type === 'Ready')?.lastTransitionTime || null,
});
