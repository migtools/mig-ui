import { LogActionTypes, LogActions } from './actions';

export const INITIAL_STATE = {
  isFetchingLogs: true,
  logErrorMsg: null,
  report: {},
  log: [],
  archive: '',
};

export const reportFetchRequest =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.reportFetchRequest>) => {
    return { ...state, isFetchingLogs: true, log: [], logErrorMsg: null, archive: '' };
  };

export const reportFetchSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.reportFetchSuccess>) => {
    return { ...state, report: action.report, isFetchingLogs: false };
  };

export const reportFetchFailure =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.reportFetchFailure>) => {
    return { ...state, isFetchingLogs: false, logErrorMsg: 'Failed to fetch log report' };
  };

export const logFetchRequest =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.logFetchRequest>) => {
    return { ...state, isFetchingLogs: true, archive: '' };
  };

export const logFetchSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.logsFetchSuccess>) => {
    return { ...state, log: action.log, isFetchingLogs: false };
  };

export const logFetchFailure =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.logsFetchFailure>) => {
    return { ...state, isFetchingLogs: false, logErrorMsg: 'Failed to fetch log' };
  };

export const createLogArchive =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.createLogArchive>) => {
    return { ...state, archive: action.url };
  };

const planReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LogActionTypes.REPORT_FETCH_SUCCESS: return reportFetchSuccess(state, action);
    case LogActionTypes.REPORT_FETCH_REQUEST: return reportFetchRequest(state, action);
    case LogActionTypes.REPORT_FETCH_FAILURE: return reportFetchFailure(state, action);
    case LogActionTypes.LOG_FETCH_SUCCESS: return logFetchSuccess(state, action);
    case LogActionTypes.LOG_FETCH_REQUEST: return logFetchRequest(state, action);
    case LogActionTypes.LOG_FETCH_FAILURE: return logFetchFailure(state, action);
    case LogActionTypes.CREATE_LOG_ARCHIVE: return createLogArchive(state, action);
    default: return state;
  }
};

export default planReducer;
