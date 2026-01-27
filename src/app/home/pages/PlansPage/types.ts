import { IMigMigration } from '../../../../client/resources/conversions';
import { ProgressVariant } from '@patternfly/react-core';

export type MigrationType = 'full' | 'state' | 'scc';
export const MIGRATION_ACTIONS = ['stage', 'cutover', 'rollback'] as const;
export type MigrationAction = (typeof MIGRATION_ACTIONS)[number];

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
