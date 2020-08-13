import { IPlan } from '../../../plan/duck/types';

export const getPlanStatusText = (plan: IPlan) => {
  const {
    hasClosedCondition,
    hasReadyCondition,
    hasNotReadyCondition,
    hasRunningMigrations,
    hasSucceededMigration,
    hasSucceededStage,
    hasCanceledCondition,
    hasCancelingCondition,
    latestType,
    latestIsFailed,
    hasConflictCondition,
    conflictErrorMsg,
    isPlanLocked,
  } = plan.PlanStatus;
  if (latestIsFailed) return `${latestType} Failed`;
  if (hasConflictCondition) return conflictErrorMsg;
  if (hasNotReadyCondition || !hasReadyCondition) return 'Not Ready';
  if (hasClosedCondition) return 'Closed';
  if (hasCancelingCondition) return `Canceling ${latestType}`;
  if (hasRunningMigrations) return `${latestType} Running`;
  if (hasCanceledCondition) return `${latestType} canceled`;
  if (hasSucceededMigration) return 'Migration Succeeded';
  if (hasSucceededStage) return 'Stage Succeeded';
  if (hasReadyCondition) return 'Ready';
  if (isPlanLocked) return 'Pending';
  return 'Waiting for status...';
};

export const getPlanInfo = (plan: IPlan) => {
  const latestMigAnalytic = plan.Analytics ? plan.Analytics[0] : null;
  const namespaces = latestMigAnalytic?.status?.analytics?.namespaces
    ? latestMigAnalytic?.status?.analytics?.namespaces
    : [];
  const isMaxResourcesLimitReached =
    latestMigAnalytic?.status?.analytics?.k8sResourcesTotal > 10000 ? true : false;

  return {
    planName: plan.MigPlan.metadata.name,
    migrationCount: plan.Migrations.length || 0,
    sourceClusterName: plan.MigPlan.spec.srcMigClusterRef.name,
    targetClusterName: plan.MigPlan.spec.destMigClusterRef.name,
    storageName: plan.MigPlan.spec.migStorageRef ? plan.MigPlan.spec.migStorageRef.name : 'N/A',
    namespaceCount: namespaces ? namespaces.length : 0,
    isMaxResourcesLimitReached,
    statusText: getPlanStatusText(plan),
  };
};

export type IPlanInfo = ReturnType<typeof getPlanInfo>;
