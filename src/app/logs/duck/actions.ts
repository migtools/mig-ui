import { IMigPlan, IMigMigration } from '../../../client/resources/conversions';
import { IMigrationLogs } from './sagas';

export const LogActionTypes = {
  LOGS_FETCH_REQUEST: 'LOGS_FETCH_REQUEST',
  LOGS_FETCH_SUCCESS: 'LOGS_FETCH_SUCCESS',
  LOGS_FETCH_FAILURE: 'LOGS_FETCH_FAILURE',
};

const logsFetchRequest = (planName: string) => ({
  type: LogActionTypes.LOGS_FETCH_REQUEST,
  planName
});

const logsFetchSuccess = (logs: IMigrationLogs) => ({
  type: LogActionTypes.LOGS_FETCH_SUCCESS,
  logs
});

const logsFetchFailure = (error: string) => ({
  type: LogActionTypes.LOGS_FETCH_FAILURE,
  error
});


export const LogActions = {
  logsFetchRequest,
  logsFetchSuccess,
  logsFetchFailure
};
