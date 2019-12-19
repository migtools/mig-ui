import { LogActionTypes, LogActions } from './actions';

export const INITIAL_STATE = {
  isFetchingLogs: true,
  logFetchErrorMsg: null,
  report: {},
  log: [],
};

export const reportFetchRequest =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.reportFetchRequest>) => {
    return { ...state, isFetchingLogs: true, log: [], logFetchErrorMsg: null };
  };

export const reportFetchSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.reportFetchSuccess>) => {
    return { ...state, report: action.report, isFetchingLogs: false };
  };

export const reportFetchFailure =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.reportFetchFailure>) => {
    return { ...state, isFetchingLogs: false, logFetchErrorMsg: 'Failed to fetch log report: ' + action.error };
  };

export const logFetchRequest =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.logsFetchRequest>) => {
    return { ...state, isFetchingLogs: true };
  };

export const logFetchSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.logsFetchSuccess>) => {
    return { ...state, log: action.log, isFetchingLogs: false };
  };

export const logFetchFailure =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.logsFetchFailure>) => {
    return { ...state, isFetchingLogs: false, logFetchErrorMsg: 'Failed to fetch log: ' + action.error };
  };

const planReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LogActionTypes.REPORT_FETCH_SUCCESS: return reportFetchSuccess(state, action);
    case LogActionTypes.REPORT_FETCH_REQUEST: return reportFetchRequest(state, action);
    case LogActionTypes.REPORT_FETCH_FAILURE: return reportFetchFailure(state, action);
    case LogActionTypes.LOGS_FETCH_SUCCESS: return logFetchSuccess(state, action);
    case LogActionTypes.LOGS_FETCH_REQUEST: return logFetchRequest(state, action);
    case LogActionTypes.LOGS_FETCH_FAILURE: return logFetchFailure(state, action);
    default: return state;
  }
};

export default planReducer;
