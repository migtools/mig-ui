import { ProgressVariant } from '@patternfly/react-core';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

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
  progressBarApplicable: boolean;
  progressBarMessage: string;
  title: string;
  variant: ProgressVariant;
  isWarning: boolean;
}

export const showConsolidatedProgressBar = (step: IStep): boolean => {
  return step.name == MigrationStepsType.Backup;
};

export interface IMigrationStepProgressObj {
  metadata: string;
  message: string;
  duration: string;
  progressVariant: ProgressVariant;
  progressBarApplicable: boolean;
  percentComplete: number;
}

// convertSItoBytes: converts SI units of storage into bytes
// useful for percentage completion calculation
const convertSItoBytes = (number: string, unit: string): number => {
  const baseUnit = 1000;
  const sizes = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  const exponent = sizes.findIndex((i) => i === unit);
  return exponent !== -1 ? Math.pow(baseUnit, exponent) * parseFloat(number) : 0;
};

// getMigrationStepProgress: parses each progress line and returns structured progress information
// used for detailed drill down pages of migration steps
// Progress messages from controller follow standard format of :
// "<resource> <namespace>/<name>: <message>"
// <message> above can contain volume transfer / backup progress in the form
// "<number> <unit> out of <number> <unit> completed"
// <unit> is a SI unit of size
export const getMigrationStepProgress = (progressLine: string): IMigrationStepProgressObj => {
  let percentComplete = 0,
    progressBarApplicable = false;
  let duration = '';

  const metadataRegex = /(.*?):.*/;
  const metadata = metadataRegex.test(progressLine) ? progressLine.match(metadataRegex)[1] : '';

  const durationRegex = /\(([a-z0-9]+)\)$/;
  const parsedDuration = durationRegex.test(progressLine)
    ? progressLine.match(durationRegex)[1]
    : '';
  if (parsedDuration !== '') {
    const elapsedTime = dayjs(parsedDuration, ['H[h]m[m]s[s]', 'm[m]s[s]', 's[s]']);
    duration = dayjs.duration(elapsedTime.diff(dayjs('0h0m0s', 'H[h]m[m]s[s]'))).humanize();
  }

  const strippedMessage = progressLine.replace(durationRegex, '');

  const messageRegex = /.*?: (.*)/;
  const message = messageRegex.test(strippedMessage) ? strippedMessage.match(messageRegex)[1] : '';

  const progressRegex = /.*?([\d\.]*) *(bytes|kB|MB|GB|TB|PB|EB)* out of (estimated total of| )*([\d\.]*) *(bytes|MB|kB|GB|TB|PB|EB)*/;

  const failedRegex = /.*?[Ff]ailed/;

  if (progressRegex.test(progressLine)) {
    progressBarApplicable = true;
    const matched = progressLine.match(progressRegex);
    const completedSoFar = matched[1] ? matched[1] : '0';
    const unitCompletedSoFar = matched[2] ? matched[2] : null;
    const totalResources = matched[4] ? matched[4] : '100';
    const unitTotalResources = matched[5] ? matched[5] : null;
    if (unitTotalResources && unitCompletedSoFar) {
      const completed = convertSItoBytes(completedSoFar, unitCompletedSoFar);
      const total = convertSItoBytes(totalResources, unitTotalResources);
      percentComplete = total !== 0 ? (completed / total) * 100 : 0;
    } else {
      const total = parseFloat(totalResources);
      const completed = parseFloat(completedSoFar);
      percentComplete = total !== 0 ? (completed / total) * 100 : 0;
    }
  }

  const progressVariant = failedRegex.test(progressLine)
    ? ProgressVariant.danger
    : ProgressVariant.success;

  return {
    metadata: metadata,
    message: message,
    duration: duration,
    progressVariant: progressVariant,
    progressBarApplicable: progressBarApplicable,
    percentComplete: percentComplete,
  };
};

export const getProgressValues = (step: IStep, migration?: IMigration): IProgressInfoObj => {
  let titleText, progressVariant, duration;
  let progressBarApplicable = false;
  let progressBarMessage = '';
  let percentComplete = 100;
  if (
    step.started &&
    !step.completed &&
    (migration.tableStatus.migrationState === 'error' || migration?.status?.errors?.length)
  ) {
    titleText = 'Error';
    progressVariant = ProgressVariant.danger;
  } else if (step.started && !step.completed) {
    titleText = step.message || step.phase || '';
  } else if (!step.started) {
    titleText = 'Not Started';
  } else if (step.failed) {
    titleText = 'Failed';
    progressVariant = ProgressVariant.danger;
  } else if (step.completed) {
    titleText = 'Complete';
    progressVariant = ProgressVariant.success;
  }

  if (showConsolidatedProgressBar(step) && step.progress) {
    const progress = getMigrationStepProgress(step.progress[0]);
    duration = progress.duration;
    percentComplete = progress.percentComplete;
    progressBarMessage = step.completed ? progress.metadata : progress.message;
    progressBarApplicable = progress.progressBarApplicable;
  }

  return {
    progressBarApplicable: progressBarApplicable,
    progressBarMessage: progressBarMessage,
    percentComplete: percentComplete,
    title: titleText,
    variant: progressVariant,
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
