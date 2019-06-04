import { Creators } from './actions';
const alertSuccess = Creators.alertSuccess;
const alertError = Creators.alertError;
const alertClear = Creators.alertClear;

const displayNotificationWithTimeout = (type, message) => {
  return async (dispatch, getState) => {
    try {
      if (type === 'Success') {
        dispatch(alertSuccess(message));
        setTimeout(() => {
          dispatch(alertClear());
        }, 5000);
      } else {
        dispatch(alertError(message));
        setTimeout(() => {
          dispatch(alertClear());
        }, 5000);
      }
    } catch (err) {
      dispatch(alertClear());
    }
  };
};

export default {
  displayNotificationWithTimeout,
  alertSuccess,
  alertError,
  alertClear,
};
