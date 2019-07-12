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

export const startDataListPolling = (params?: any) => ({
  type: 'DATA_LIST_POLL_START',
  params,
});

export const stopDataListPolling = () => ({
  type: 'DATA_LIST_POLL_STOP',
});

export const startClusterPolling = (params?: any) => ({
  type: 'CLUSTER_POLL_START',
  params,
});

export const stopClusterPolling = () => ({
  type: 'CLUSTER_POLL_STOP',
});

export const startStatusPolling = (params?: any) => ({
  type: 'STATUS_POLL_START',
  params,
});

export const stopStatusPolling = () => ({
  type: 'STATUS_POLL_STOP',
});
