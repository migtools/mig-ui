import { ProgressVariant } from '@patternfly/react-core';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(duration);
dayjs.extend(relativeTime);

import { IMigration, IMigrationStatus, IPlan, IStep } from '../../../plan/duck/types';
import { MigrationStepsType } from './types';

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
    latestMigAnalytic?.status?.analytics?.k8sResourceTotal > 10000 ? true : false;
  return {
    planName: plan.MigPlan.metadata.name,
    migrationCount: plan.Migrations.length || 0,
    sourceClusterName: plan.MigPlan.spec.srcMigClusterRef.name,
    targetClusterName: plan.MigPlan.spec.destMigClusterRef.name,
    storageName: plan.MigPlan.spec.migStorageRef ? plan.MigPlan.spec.migStorageRef.name : 'N/A',
    namespaceCount: plan.MigPlan.spec.namespaces.length,
    isMaxResourcesLimitReached,
    statusText: getPlanStatusText(plan),
  };
};

export const findCurrentStep = (
  pipeline: IStep[]
): { currentStep: IStep | undefined; currentStepIndex: number } => {
  const currentStep = pipeline
    .slice(0)
    .reverse()
    .find((step) => !!step.started && !step.completed);
  const currentStepIndex = currentStep ? pipeline.indexOf(currentStep) : 0;
  return { currentStep, currentStepIndex };
};

export const getPipelineSummaryTitle = (status: IMigrationStatus): string => {
  const { currentStep } = findCurrentStep(status?.pipeline || []);
  if (status?.phase === 'Completed') {
    return MigrationStepsType.Completed;
  }
  if (currentStep?.started && !currentStep?.completed) {
    let title: string;
    title = status?.errors?.length ? `${MigrationStepsType.Error} - ` : '';
    if (currentStep) {
      title = `${title}${MigrationStepsType[currentStep.name] || currentStep.name}`;
    }
    return title;
  }
  return MigrationStepsType.NotStarted;
};

export interface IProgressInfoObj {
  percentComplete: number;
  title: string;
  variant: ProgressVariant;
  isWarning: boolean;
}
export const getProgressValues = (step: IStep, migration?: IMigration): IProgressInfoObj => {
  // title={step.phase || migration.status.phase}
  // if (step.started && !step.completed) {
  //   return {
  //     percentComplete: 100,
  //     title: 'Complete',
  //     variant: ProgressVariant.success,
  //     isWarning: false,
  //   };
  // }else{
  let titleText;
  if (
    step.started &&
    !step.completed &&
    (migration.tableStatus.migrationState === 'error' || migration?.status?.errors?.length)
  ) {
    titleText = 'Error';
  } else if (step.started && !step.completed) {
    titleText = step?.progress?.slice(-1).pop() || step.message || '';
  } else if (!step.started) {
    titleText = 'Not Started';
  } else if (step.completed) {
    titleText = 'Complete';
  }
  return {
    percentComplete: 100,
    title: titleText,
    variant: ProgressVariant.success,
    isWarning: false,
  };
};

export const getElapsedTime = (step: IStep, migration: IMigration): string => {
  let elapsedTime;
  if (
    step.started &&
    !step.completed &&
    (migration.tableStatus.migrationState === 'error' || migration?.status?.errors?.length)
  ) {
    const endTime = dayjs(migration.tableStatus.end);
    const startedStepTime = dayjs(step?.started);
    const durationLength: any = dayjs.duration(endTime.diff(startedStepTime));
    elapsedTime = durationLength.humanize();
  } else if (step.started && !step.completed) {
    const now = dayjs();
    const startedStepTime = dayjs(step?.started);
    const durationLength: any = dayjs.duration(now.diff(startedStepTime));
    elapsedTime = durationLength.humanize();
  } else if (!step.started) {
    elapsedTime = '';
  } else {
    const startedStepTime = dayjs(step?.started);
    const completedStepTime = dayjs(step?.completed);
    const durationLength: any = dayjs.duration(completedStepTime.diff(startedStepTime));
    elapsedTime = durationLength.humanize();
  }
  return elapsedTime;
};

export type IPlanInfo = ReturnType<typeof getPlanInfo>;
