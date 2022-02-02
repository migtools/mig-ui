import { ProgressVariant } from '@patternfly/react-core';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

import {
  IMigPlan,
  IMigPlanStorageClass,
  IMigration,
  IPlan,
  IPlanPersistentVolume,
  IStep,
} from '../../../plan/duck/types';
import {
  MigrationStepsType,
  IProgressInfoObj,
  IStepProgressInfo,
  MigrationType,
  MigrationAction,
  MIGRATION_ACTIONS,
} from './types';

export const getPlanStatusText = (plan: IPlan) => {
  if (!plan || !plan?.PlanStatus) {
    return '';
  }

  const {
    hasClosedCondition = null,
    hasReadyCondition = null,
    hasNotReadyCondition = null,
    hasRunningMigrations = null,
    hasSucceededCutover = null,
    hasSucceededWithWarningsCondition = null,
    hasSucceededStage = null,
    hasSucceededRollback = null,
    hasCanceledCondition = null,
    hasCancelingCondition = null,
    hasCriticalCondition = null,
    latestAction = null,
    latestIsFailed = null,
    hasConflictCondition = null,
    conflictErrorMsg = null,
    isPlanLocked = null,
    hasWarnCondition = null,
    hasDVMBlockedCondition = null,
  } = plan?.PlanStatus;

  const latestActionStr = migrationActionToString(latestAction);

  if (isPlanLocked) return 'Pending';
  if (latestIsFailed) return `${latestActionStr} failed`;
  if (hasCriticalCondition) return `${latestActionStr} failed`;
  if (hasConflictCondition) return conflictErrorMsg;
  if (hasClosedCondition) return 'Closed';
  if (hasCancelingCondition) return `Canceling ${latestActionStr}`;
  if (hasRunningMigrations) return `${latestActionStr} in progress`;
  if (hasCanceledCondition) return `${latestActionStr} canceled`;
  if (hasNotReadyCondition || !hasReadyCondition) return 'Not Ready';
  if (hasSucceededRollback) return 'Rollback succeeded';
  if (hasDVMBlockedCondition) return 'In progress';
  if (hasSucceededCutover && hasWarnCondition) return 'Migration completed with warnings';
  if (hasSucceededWithWarningsCondition) return `${latestActionStr} completed with warnings`;
  if (hasSucceededCutover) return 'Migration succeeded';
  if (hasSucceededStage) return 'Stage succeeded';
  if (hasReadyCondition) return 'Ready';
  return 'Waiting for status...';
};

export const getPlanInfo = (plan: IPlan) => {
  const latestMigAnalytic = plan.Analytics ? plan.Analytics[0] : null;
  const isMaxResourcesLimitReached =
    latestMigAnalytic?.status?.analytics?.k8sResourceTotal > 10000 ? true : false;
  const migrationType = getMigrationTypeFromPlan(plan.MigPlan);
  return {
    planName: plan.MigPlan.metadata.name,
    migrationType: migrationType,
    migrationCount: plan.Migrations.length || 0,
    sourceClusterName: plan.MigPlan.spec.srcMigClusterRef.name
      ? plan.MigPlan.spec?.srcMigClusterRef?.name
      : '',
    targetClusterName: plan.MigPlan.spec.destMigClusterRef.name
      ? plan.MigPlan.spec.destMigClusterRef.name
      : '',
    storageName: plan.MigPlan.spec.migStorageRef ? plan.MigPlan.spec.migStorageRef.name : 'N/A',
    namespaceCount: plan.MigPlan.spec?.namespaces?.length || 0,
    isMaxResourcesLimitReached,
    statusText: getPlanStatusText(plan),
  };
};

export const getMigrationTypeFromPlan = (plan: IMigPlan): MigrationType => {
  let migrationType = plan?.metadata?.annotations['migration.openshift.io/selected-migplan-type'];
  if (migrationType === undefined) {
    if (plan?.status?.conditions) {
      plan?.status?.conditions?.forEach((element) => {
        if (element.type === 'MigrationTypeIdentified') {
          switch (element.reason) {
            case 'StateMigrationPlan':
              migrationType = 'state';
              break;
            case 'StorageConversionPlan':
              migrationType = 'scc';
              break;
            default:
              migrationType = 'full';
          }
        }
      });
    }
  }
  if (migrationType === undefined) {
    migrationType = 'full';
  }
  return migrationType;
};

export const findCurrentStep = (pipeline: IStep[]): IStep => {
  const currentStep = pipeline
    .slice(0)
    .reverse()
    .find((step) => !!step.started && !step.completed);
  return currentStep;
};

export const getPipelineSummaryTitle = (migration: IMigration): string => {
  if (migration === null || !migration) {
    return MigrationStepsType.NotStarted;
  }
  const { status, tableStatus } = migration;
  const currentStep = findCurrentStep(status?.pipeline || []);
  if (status?.phase === 'Completed') {
    if (tableStatus?.isSucceededWithWarnings) {
      return MigrationStepsType.CompletedWithWarnings;
    }
    if (tableStatus?.isCanceled) {
      return MigrationStepsType.Canceled;
    }
    if (tableStatus?.isFailed) {
      return MigrationStepsType.Failed;
    }
    if (tableStatus?.isPaused) {
      return MigrationStepsType.Paused;
    }
    return MigrationStepsType.Completed;
  }
  if (currentStep?.started && !currentStep?.completed) {
    let title: any;
    const isError = status?.errors?.length || tableStatus.migrationState === 'error';

    title = isError ? `${MigrationStepsType.Error} - ` : '';
    if (currentStep) {
      title = `${title}${currentStep.name}`;
    }
    return title;
  }
  return MigrationStepsType.NotStarted;
};

// returns step details page title text based on step
export const getStepPageTitle = (step: IStep): string => {
  switch (step.name) {
    case MigrationStepsType.Prepare:
      return 'Preparing for migration';
    case MigrationStepsType.Backup:
      return 'Creating initial backup';
    case MigrationStepsType.StageBackup:
      return 'Creating stage backup';
    case MigrationStepsType.StageRestore:
      return 'Creating stage restore';
    case MigrationStepsType.Restore:
      return 'Creating final restore';
    case MigrationStepsType.Cleanup:
      return 'Cleaning up';
    default:
      return `${step.name} details`;
  }
};

// parses golang timestamps
export const formatGolangTimestamp = (timestamp: string): string => {
  const formats = [
    'YYYY-M-D[T]H:m:s[Z]',
    'YYYY-MM-DD[T]HH:mm:ss[Z]',
    'YYYY-M-D[T]HH:mm:ss[Z]',
    'YYYY-MM-DD[T]H:m:s[Z]',
  ];
  let formattedTime;
  try {
    formattedTime = dayjs(timestamp, formats).format('D MMM YYYY, HH:mm:ss');
  } catch (e) {
    formattedTime = timestamp;
  }
  return formattedTime;
};

// convertSItoBytes: converts SI units of storage into bytes
// useful for percentage completion calculation
const convertSItoBytes = (number: string, unit: string): number => {
  const baseUnit = 1000;
  const sizes = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  const exponent = sizes.findIndex((i) => i === unit);
  return exponent !== -1 ? Math.pow(baseUnit, exponent) * parseFloat(number) : 0;
};

export const showConsolidatedProgressBar = (step: IStep): boolean => {
  return step.name == MigrationStepsType.Backup || step.name == MigrationStepsType.Restore;
};

// getMigrationStepProgress: parses each progress line and returns structured progress information
// used for detailed drill down pages of migration steps
// Progress messages from controller follow standard format of :
// "<resource> <namespace>/<name>: <message>"
// <message> above can contain volume transfer / backup progress in the form
// "<number> <unit> out of <number> <unit> completed"
// <unit> is a SI unit of size
export const getMigrationStepProgress = (progressLine: string): IStepProgressInfo => {
  let percentComplete = 0,
    progressBarApplicable = false;
  let duration = '';

  // Parse first part of message progress line
  const metadataRegex = /(.*?):.*/;
  const metadata = metadataRegex.test(progressLine) ? progressLine.match(metadataRegex)[1] : '';

  // Parse duration if it's available in the progress line
  const durationRegex = /\(([a-z0-9]+)\)$/;
  const parsedDuration = durationRegex.test(progressLine)
    ? progressLine.match(durationRegex)[1]
    : '';
  if (parsedDuration !== '') {
    const elapsedTime = dayjs(parsedDuration, ['H[h]m[m]s[s]', 'm[m]s[s]', 's[s]']);
    duration = dayjs.duration(elapsedTime.diff(dayjs('0h0m0s', 'H[h]m[m]s[s]'))).humanize();
  }

  // Parse the <message> field in progress line
  const strippedMessage = progressLine.replace(durationRegex, '');
  const messageRegex = /.*?: (.*)/;
  let message = messageRegex.test(strippedMessage) ? strippedMessage.match(messageRegex)[1] : '';
  // strip progress percentage from message as the progress bar already shows it
  message = message.replace(/[\d\.]*%/, '');

  // Progress parsing for Velero Backup / Restore
  const progressRegex =
    /.*?([\d\.]*) *(bytes|kB|MB|GB|TB|PB|EB)* out of (estimated total of| )*([\d\.]*) *(bytes|MB|kB|GB|TB|PB|EB)*/;
  if (progressRegex.test(progressLine)) {
    progressBarApplicable = true;
    const matched = progressLine.match(progressRegex);
    const completedSoFar = matched[1] ? matched[1] : '0';
    const unitCompletedSoFar = matched[2] ? matched[2] : null;
    const totalResources = matched[4] ? matched[4] : '100';
    const unitTotalResources = matched[5] ? matched[5] : null;
    try {
      if (unitTotalResources && unitCompletedSoFar) {
        const completed = convertSItoBytes(completedSoFar, unitCompletedSoFar);
        const total = convertSItoBytes(totalResources, unitTotalResources);
        percentComplete = total !== 0 ? (completed / total) * 100 : 0;
      } else {
        const total = parseFloat(totalResources);
        const completed = parseFloat(completedSoFar);
        percentComplete = total !== 0 ? (completed / total) * 100 : 0;
      }
    } catch (e) {
      progressBarApplicable = false;
    }
  }

  // Progress parsing for Direct Volume migration
  const directMigrationProgressRegex = /.*?([\d\.]*)%/;
  if (directMigrationProgressRegex.test(progressLine)) {
    progressBarApplicable = true;
    try {
      percentComplete = parseFloat(progressLine.match(directMigrationProgressRegex)[1]);
    } catch (e) {
      progressBarApplicable = false;
    }
  }

  // Determine if the progress line indicates success / failure
  const failedRegex = /.*?[Ff]ail/;
  const completedRegex = /.*?([Cc]omplete|[Ss]ucc(ess|eed))/;
  const progressVariant = failedRegex.test(message)
    ? ProgressVariant.danger
    : ProgressVariant.success;
  const isFailed = failedRegex.test(message) ? true : false;
  const isCompleted = completedRegex.test(message) ? true : isFailed ? true : false;

  return {
    metadata: metadata,
    progressMessage: message,
    duration: duration,
    progressVariant: progressVariant,
    progressBarApplicable: progressBarApplicable,
    progressPercentage: percentComplete,
    isCompleted: isCompleted,
    isFailed: isFailed,
  };
};

export const getProgressValues = (step: IStep, migration?: IMigration): IProgressInfoObj => {
  const progressValues: IProgressInfoObj = {
    title: '',
    detailsAvailable: false,
    consolidatedProgress: {
      duration: '',
      isCompleted: false,
      isFailed: false,
      metadata: '',
      progressBarApplicable: false,
      progressMessage: '',
      progressPercentage: 0,
      progressVariant: ProgressVariant.success,
    },
    detailedProgress: [],
  };
  if (
    step.started &&
    !step.completed &&
    (migration.tableStatus.migrationState === 'error' || migration?.status?.errors?.length)
  ) {
    progressValues.title = 'Error';
    progressValues.consolidatedProgress.progressVariant = ProgressVariant.danger;
  } else if (step.started && !step.completed) {
    progressValues.title = step.message || step.phase || '';
  } else if (step.skipped) {
    progressValues.title = 'Skipped';
  } else if (!step.started) {
    progressValues.title = 'Not Started';
    return progressValues;
  } else if (step.failed) {
    progressValues.title = 'Failed';
    progressValues.consolidatedProgress.progressVariant = ProgressVariant.danger;
  } else if (step.completed) {
    progressValues.title = 'Complete';
    progressValues.consolidatedProgress.progressVariant = ProgressVariant.success;
  } else {
    progressValues.title = step.message;
  }

  if (showConsolidatedProgressBar(step) && step.progress) {
    const progress = getMigrationStepProgress(step.progress[0]);
    progressValues.consolidatedProgress.duration = progress.duration;
    progressValues.consolidatedProgress.progressPercentage = progress.progressPercentage;
    progressValues.consolidatedProgress.progressMessage = step.completed
      ? progress.metadata
      : progress.progressMessage;
    progressValues.consolidatedProgress.progressBarApplicable = progress.progressBarApplicable;
    progressValues.consolidatedProgress.progressVariant = progress.progressVariant;
  } else {
    step.progress?.forEach((progressMessage) => {
      const parsedProgress = getMigrationStepProgress(progressMessage);
      if (!progressValues.detailsAvailable) {
        progressValues.detailsAvailable =
          parsedProgress.metadata !== '' && parsedProgress.progressMessage !== '' ? true : false;
      }
      progressValues.detailedProgress.push(parsedProgress);
    });
  }

  return progressValues;
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

export const targetStorageClassToString = (storageClass: IMigPlanStorageClass) =>
  storageClass && `${storageClass.name}:${storageClass.provisioner}`;

export const pvcNameToString = (pvc: IPlanPersistentVolume['pvc']) => {
  const includesMapping = pvc.name.includes(':');
  if (includesMapping) {
    return pvc.name.split(':')[0];
  }
  return pvc.name;
};

export const migrationTypeToString = (migrationType: MigrationType) =>
  migrationType === 'full'
    ? 'Full migration'
    : migrationType === 'state'
    ? 'State migration'
    : migrationType === 'scc'
    ? 'Storage class conversion'
    : '';

export const migrationActionToString = (action?: MigrationAction) =>
  action === 'stage'
    ? 'Stage'
    : action === 'cutover'
    ? 'Cutover'
    : action === 'rollback'
    ? 'Rollback'
    : '';

// Booleans in the Migration spec are unintuitive, we'll try to keep the logic mapping those to type/action centralized here
const MIG_SPEC_ACTION_FIELDS = ['migrateState', 'stage', 'quiescePods', 'rollback'] as const;
type MigSpecActionField = typeof MIG_SPEC_ACTION_FIELDS[number];
type MigSpecActionFields = Pick<IMigration['spec'], MigSpecActionField>;

const migSpecByAction: Record<MigrationType, Record<MigrationAction, MigSpecActionFields>> = {
  full: {
    stage: { migrateState: false, stage: true, quiescePods: false, rollback: false },
    cutover: { migrateState: false, stage: false, quiescePods: false, rollback: false }, // quiescePods is a user selection here
    rollback: { migrateState: false, stage: false, quiescePods: false, rollback: true },
  },
  state: {
    stage: { migrateState: true, stage: false, quiescePods: false, rollback: false },
    cutover: { migrateState: true, stage: false, quiescePods: true, rollback: false },
    rollback: { migrateState: false, stage: false, quiescePods: false, rollback: true },
  },
  scc: {
    stage: { migrateState: true, stage: false, quiescePods: false, rollback: false },
    cutover: { migrateState: true, stage: false, quiescePods: true, rollback: false },
    rollback: { migrateState: false, stage: false, quiescePods: false, rollback: true },
  },
};

export const actionToMigSpec = (
  type: MigrationType,
  action: MigrationAction,
  quiescePodsOnFullMigCutover: boolean
): MigSpecActionFields => {
  const specFields = migSpecByAction[type][action];
  if (type === 'full' && action === 'cutover') {
    specFields.quiescePods = quiescePodsOnFullMigCutover;
  }
  return specFields;
};

export const migSpecToAction = (
  type: MigrationType,
  spec?: IMigration['spec']
): MigrationAction | undefined => {
  if (!spec) return undefined;
  return MIGRATION_ACTIONS.find((action) => {
    const possibleSpec = migSpecByAction[type][action];
    const fieldsToCompare =
      type === 'full'
        ? MIG_SPEC_ACTION_FIELDS.filter((field) => field !== 'quiescePods')
        : MIG_SPEC_ACTION_FIELDS;
    return fieldsToCompare.every((field) => possibleSpec[field] === (spec[field] || false));
  });
};

export const getSuggestedPvStorageClasses = (migPlan?: IMigPlan) => {
  let pvStorageClassAssignment = {};
  const migPlanPvs = migPlan?.spec.persistentVolumes;
  if (!migPlanPvs) return null;
  const storageClasses = migPlan?.status?.destStorageClasses || [];
  pvStorageClassAssignment = migPlanPvs.reduce((assignedScs, pv) => {
    const suggestedStorageClass = storageClasses.find(
      (sc) => (sc !== '' && sc.name) === pv.selection.storageClass
    );
    return {
      ...assignedScs,
      [pv.name]: suggestedStorageClass ? suggestedStorageClass : '',
    };
  }, {});
  return pvStorageClassAssignment;
};
