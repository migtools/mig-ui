// TODO add type for plan arg
export const getPlanStatusText = (plan) => {
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
  if (hasClosedCondition) return 'Closed';
  if (hasConflictCondition) return conflictErrorMsg;
  if (hasCancelingCondition) return `Canceling ${latestType}`;
  if (hasRunningMigrations) return `${latestType} Running`;
  if (hasCanceledCondition) return `${latestType} canceled`;
  if (hasSucceededMigration) return 'Migration Succeeded';
  if (hasSucceededStage) return 'Stage Succeeded';
  if (hasNotReadyCondition || !hasReadyCondition) return 'Not Ready';
  if (hasReadyCondition) return 'Ready';
  if (isPlanLocked) return 'Pending';
  return 'Waiting for status...';
};

// TODO add type for plan arg
export const getPlanInfo = (plan) => ({
  planName: plan.MigPlan.metadata.name,
  migrationCount: plan.Migrations.length || 0,
  sourceClusterName: plan.MigPlan.spec.srcMigClusterRef.name,
  targetClusterName: plan.MigPlan.spec.destMigClusterRef.name,
  storageName: plan.MigPlan.spec.migStorageRef ? plan.MigPlan.spec.migStorageRef.name : 'N/A',
  pvCount: plan.MigPlan.spec.persistentVolumes ? plan.MigPlan.spec.persistentVolumes.length : 0,
  statusText: getPlanStatusText(plan),
});

export type IPlanInfo = ReturnType<typeof getPlanInfo>;
