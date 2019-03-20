import Types from './types';
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
  [Types.CLEAR]: clear,
  [Types.SUCCESS]: success,
  [Types.ERROR]: failure,
};

export default createReducer(INITIAL_STATE, HANDLERS);
