import { alertSuccess, alertError, alertProgress, alertClear } from './actions';
const alertErrorTimeout = (message: string) => {
  return async (dispatch, getState) => {
    try {
      dispatch(alertError(message));
      setTimeout(() => {
        dispatch(alertClear());
      }, 5000);
    } catch (err) {
      dispatch(alertClear());
    }
  };
};
const alertSuccessTimeout = (message: string) => {
  return async (dispatch, getState) => {
    try {
      dispatch(alertSuccess(message));
      setTimeout(() => {
        dispatch(alertClear());
      }, 5000);
    } catch (err) {
      dispatch(alertClear());
    }
  };
};
const alertProgressTimeout = (message: string) => {
  return async (dispatch, getState) => {
    try {
      dispatch(alertProgress(message));
      setTimeout(() => {
        dispatch(alertClear());
      }, 5000);
    } catch (err) {
      dispatch(alertClear());
    }
  };
};

export default {
  alertSuccessTimeout,
  alertErrorTimeout,
  alertProgressTimeout,
  alertClear,
};
