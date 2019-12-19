import { IMigPlan, IMigMigration } from '../../../client/resources/conversions';
import { IPodLogSource, IPlanReport, IPlanLogSources } from '../../../client/resources/convension';

export const LogActionTypes = {
  REPORT_FETCH_REQUEST: 'REPORT_FETCH_REQUEST',
  REPORT_FETCH_SUCCESS: 'REPORT_FETCH_SUCCESS',
  REPORT_FETCH_FAILURE: 'REPORT_FETCH_FAILURE',
  LOGS_FETCH_REQUEST: 'LOGS_FETCH_REQUEST',
  LOGS_FETCH_SUCCESS: 'LOGS_FETCH_SUCCESS',
  LOGS_FETCH_FAILURE: 'LOGS_FETCH_FAILURE',
};

const reportFetchRequest = (planName: string) => ({
  type: LogActionTypes.REPORT_FETCH_REQUEST,
  planName
});

const reportFetchSuccess = (report: IPlanLogSources) => ({
  type: LogActionTypes.REPORT_FETCH_SUCCESS,
  report
});

const reportFetchFailure = (error: string) => ({
  type: LogActionTypes.REPORT_FETCH_FAILURE,
  error
});

const logsFetchRequest = (logPath: string) => ({
  type: LogActionTypes.LOGS_FETCH_REQUEST,
  logPath
});

const logsFetchSuccess = (log: string[]) => ({
  type: LogActionTypes.LOGS_FETCH_SUCCESS,
  log
});

const logsFetchFailure = (error: string) => ({
  type: LogActionTypes.LOGS_FETCH_FAILURE,
  error
});


export const LogActions = {
  logsFetchRequest,
  logsFetchSuccess,
  logsFetchFailure,
  reportFetchRequest,
  reportFetchSuccess,
  reportFetchFailure,
};
