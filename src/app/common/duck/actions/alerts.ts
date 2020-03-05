export const AlertActionTypes = {
  ALERT_SUCCESS: 'ALERT_SUCCESS',
  ALERT_ERROR: 'ALERT_ERROR',
  ALERT_PROGRESS: 'ALERT_PROGRESS',
  ALERT_CLEAR: 'ALERT_CLEAR',
  ALERT_ERROR_MODAL: 'ALERT_ERROR_MODAL',
  ERROR_MODAL_CLEAR: 'ERROR_MODAL_CLEAR',
  ALERT_PROGRESS_TIMEOUT: 'ALERT_PROGRESS_TIMEOUT',
  ALERT_ERROR_TIMEOUT: 'ALERT_ERROR_TIMEOUT',
  ALERT_SUCCESS_TIMEOUT: 'ALERT_SUCCESS_TIMEOUT',
};

const alertSuccess = (text: string) => ({
  type: AlertActionTypes.ALERT_SUCCESS, text
});

const alertError = (text: string) => ({
  type: AlertActionTypes.ALERT_ERROR, text
});

const alertProgress = (text: string) => ({
  type: AlertActionTypes.ALERT_PROGRESS, text
});

const alertClear = () => ({
  type: AlertActionTypes.ALERT_CLEAR
});


const alertProgressTimeout = (params?: any) => ({
  type: AlertActionTypes.ALERT_PROGRESS_TIMEOUT,
  params,
});

const alertErrorTimeout = (params?: any) => ({
  type: AlertActionTypes.ALERT_ERROR_TIMEOUT,
  params,
});

const alertSuccessTimeout = (params?: any) => ({
  type: AlertActionTypes.ALERT_SUCCESS_TIMEOUT,
  params,
});

//error modal actions
const errorModalClear = () => ({
  type: AlertActionTypes.ERROR_MODAL_CLEAR
});

const alertErrorModal = (errorModalObject: any) => ({
  type: AlertActionTypes.ALERT_ERROR_MODAL,
  errorModalObject
});
//

export const AlertActions = {
  alertSuccess,
  alertError,
  alertProgress,
  alertClear,
  errorModalClear,
  alertErrorModal,
  alertSuccessTimeout,
  alertErrorTimeout,
  alertProgressTimeout
};