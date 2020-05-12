import { IMigMigration } from '../../../../../client/resources/conversions';

export interface IMigration extends IMigMigration {
  tableStatus: {
    copied: number;
    end: string;
    isFailed: boolean;
    isSucceeded: boolean;
    migrationState: string;
    moved: number;
    progress: number;
    start: string;
    stepName: string;
  };
}
