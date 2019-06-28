export const ALERT_SUCCESS = 'ALERT_SUCCESS';
export const ALERT_ERROR = 'ALERT_ERROR';
export const ALERT_CLEAR = 'ALERT_CLEAR';
export const UPDATE_DATA_LIST_POLLING_STATS = 'UPDATE_DATA_LIST_POLLING_STATS';
export const UPDATE_STATUS_POLLING_STATS = 'UPDATE_STATUS_POLLING_STATS';

export function alertSuccess(text: string) {
  return { type: ALERT_SUCCESS, text };
}
export function alertError(text: string) {
  return { type: ALERT_ERROR, text };
}
export function alertClear() {
  return { type: ALERT_CLEAR };
}

export const updateDataListPollingStats = stats => ({
  type: 'UPDATE_DATA_LIST_POLLING_STATS',
  stats,
});

export const startDataListPolling = (params?: any) => ({
  type: 'DATA_LIST_POLL_START',
  params,
});

export const stopDataListPolling = () => ({
  type: 'DATA_LIST_POLL_STOP',
});

export const updateStatusPollingStats = stats => ({
  type: 'UPDATE_STATUS_POLLING_STATS',
  stats,
});
