export const ALERT_SUCCESS = 'ALERT_SUCCESS';
export const ALERT_ERROR = 'ALERT_ERROR';
export const ALERT_PROGRESS = 'ALERT_PROGRESS';
export const ALERT_CLEAR = 'ALERT_CLEAR';

export const alertSuccess = (text: string) => {
  return { type: ALERT_SUCCESS, text };
};
export const alertError = (text: string) => {
  return { type: ALERT_ERROR, text };
};
export const alertProgress = (text: string) => {
  return { type: ALERT_PROGRESS, text };
};
export const alertClear = () => {
  return { type: ALERT_CLEAR };
};

export const alertProgressTimeout = (params?: any) => ({
  type: 'ALERT_PROGRESS_TIMEOUT',
  params,
});

export const alertErrorTimeout = (params?: any) => ({
  type: 'ALERT_ERROR_TIMEOUT',
  params,
});

export const alertSuccessTimeout = (params?: any) => ({
  type: 'ALERT_SUCCESS_TIMEOUT',
  params,
});
