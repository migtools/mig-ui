import { IMigMigration } from '../../../../client/resources/conversions';

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
}
