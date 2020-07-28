import { IPlan } from '../../plan/duck/types';

const filterPlanConditions = (conditions: SomeType): SomeReturnType => ({
  hasClosedCondition: conditions.someLogicHere(),
  hasReadyCondition: conditions.someLogicHere(),
  hasPlanError: conditions.someLogicHere(),
  hasConflictCondition: conditions.someLogicHere(),
  hasPODWarnCondition: conditions.someLogicHere(),
  hasPVWarnCondition: conditions.someLogicHere(),
  conflictErrorMsg: conditions.someLogicHere(),
});

// export const getPlanInfo = (plan: IPlan) => ({
//   planName: plan.MigPlan.metadata.name,
//   migrationCount: plan.Migrations.length || 0,
//   sourceClusterName: plan.MigPlan.spec.srcMigClusterRef.name,
//   targetClusterName: plan.MigPlan.spec.destMigClusterRef.name,
//   storageName: plan.MigPlan.spec.migStorageRef ? plan.MigPlan.spec.migStorageRef.name : 'N/A',
//   pvCount: plan.MigPlan.spec.persistentVolumes ? plan.MigPlan.spec.persistentVolumes.length : 0,
//   statusText: getPlanStatusText(plan),
// });

// export type IPlanInfo = ReturnType<typeof getPlanInfo>;

// export type IPlanInfo = ReturnType<typeof getPlanInfo>;
