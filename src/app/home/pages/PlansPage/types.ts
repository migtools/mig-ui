import { IMigMigration } from '../../../../client/resources/conversions';
import { ProgressVariant } from '@patternfly/react-core';

export interface IMigrationWithStatus extends IMigMigration {
  tableStatus: {
    copied: number;
    end: string;
    isFailed: boolean;
    isSucceeded: boolean;
    isCanceled: boolean;
    isCanceling: boolean;
    migrationState: string;
    moved: number;
    progress: number;
    start: string;
    stepName: string;
  };
}

export interface IAddPlanDisabledObjModel {
  isAddPlanDisabled: boolean;
  disabledText: string;
}

export enum MigrationStepsType {
  Prepare = 'Prepare',
  Backup = 'Backup',
  StageBackup = 'StageBackup',
  StageRestore = 'StageRestore',
  Restore = 'Restore',
  Cleanup = 'Cleanup',
  //Fake steps to show UI status
  NotStarted = 'NotStarted',
  Error = 'Error',
  Completed = 'Completed',
  CompletedWithWarnings = 'Completed with warnings',
  Canceled = 'Canceled',
  Failed = 'Failed',
  Paused = 'Paused',
}

export interface IProgressInfoObj {
  title: string;
  detailsAvailable: boolean;
  consolidatedProgress: IStepProgressInfo;
  detailedProgress: IStepProgressInfo[];
}

export interface IStepProgressInfo {
  progressBarApplicable: boolean;
  progressPercentage: number;
  progressMessage: string;
  progressVariant: ProgressVariant;
  isFailed: boolean;
  isCompleted: boolean;
  metadata: string;
  duration: string;
}
