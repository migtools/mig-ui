import { Types } from './actions';
import { createReducer } from 'reduxsauce';
export const INITIAL_STATE = {};

export const success = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    alertType: 'alert-success',
    alertMessage: action.message,
  };
};

export const failure = (state = INITIAL_STATE, action) => {
  const am = action.alertMessage;
  let msg;

  // TODO: We really shouldn't accept strings, and Errors. The action creator's
  // interface should be improved to do compile time type checking and accept
  // either/or. It's not simple however, because we're currently using reduxsauce.
  // Need to investigate a way to improve this.
  if (typeof am === 'string' || am instanceof String) {
    msg = am;
  } else if (am instanceof Error) {
    msg = am.toString();
  } else {
    throw new Error('AlertError received an alert message that is not a string, or an Error!');
  }

  return { ...state, alertMessage: msg, alertType: 'error' };
};
export const clear = (state = INITIAL_STATE, action) => {
  return {};
};

export const HANDLERS = {
  [Types.ALERT_CLEAR]: clear,
  [Types.ALERT_SUCCESS]: success,
  [Types.ALERT_ERROR]: failure,
};

export default createReducer(INITIAL_STATE, HANDLERS);
