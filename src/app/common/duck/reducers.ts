import { Types } from './actions';
import { createReducer } from 'reduxsauce';
export const INITIAL_STATE = {};

export const success = (state = INITIAL_STATE, action) => {
  return { ...state, alertType: 'alert-success', alertMessage: action.message };
};

export const failure = (state = INITIAL_STATE, action) => {
  return { ...state, alertMessage: action.alertMessage, alertType: 'error' };
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
