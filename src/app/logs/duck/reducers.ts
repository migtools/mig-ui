import { LogActionTypes, LogActions } from './actions';

export const INITIAL_STATE = {
  isFetchingLogs: true,
  logs: {},
};
export const logsFetchRequest =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.logsFetchSuccess>) => {
    return { ...state, isFetchingLogs: true };
  };

export const logsFetchSuccess =
  (state = INITIAL_STATE, action: ReturnType<typeof LogActions.logsFetchSuccess>) => {
    return { ...state, logs: action.logs, isFetchingLogs: false };
  };

const planReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LogActionTypes.LOGS_FETCH_REQUEST: return logsFetchRequest(state, action);
    case LogActionTypes.LOGS_FETCH_SUCCESS: return logsFetchSuccess(state, action);
    default: return state;
  }
};

export default planReducer;
