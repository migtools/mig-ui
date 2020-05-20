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
