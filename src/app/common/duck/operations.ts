import { alertSuccess, alertError, alertClear } from './actions';
const alertErrorTimeout = message => {
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
const alertSuccessTimeout = message => {
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

export default {
  alertSuccessTimeout,
  alertErrorTimeout,
  alertClear,
};
