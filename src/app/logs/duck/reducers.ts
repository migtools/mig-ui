import { LogActionTypes, LogActions } from './actions';

export const INITIAL_STATE = {
  isFetchingLogs: true,
  logFetchErrorMsg: null,
  logs: {},
};
export const logsFetchRequest =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.logsFetchRequest>) => {
    return { ...state, isFetchingLogs: true, logFetchErrorMsg: null };
  };

export const logsFetchSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.logsFetchSuccess>) => {
    return { ...state, logs: action.logs, isFetchingLogs: false, logFetchErrorMsg: null };
  };

export const logsFetchFailure =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.logsFetchFailure>) => {
    return { ...state, isFetchingLogs: false, logFetchErrorMsg: 'Failed to fetch logs.' };
  };

const planReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LogActionTypes.LOGS_FETCH_REQUEST: return logsFetchRequest(state, action);
    case LogActionTypes.LOGS_FETCH_SUCCESS: return logsFetchSuccess(state, action);
    case LogActionTypes.LOGS_FETCH_FAILURE: return logsFetchFailure(state, action);
    default: return state;
  }
};

export default planReducer;
