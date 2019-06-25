export const ALERT_SUCCESS = 'ALERT_SUCCESS';
export const ALERT_ERROR = 'ALERT_ERROR';
export const ALERT_CLEAR = 'ALERT_CLEAR';
export const UPDATE_POLLING_STATS = 'UPDATE_POLLING_STATS';
export const POLL_START = 'POLL_START';
export const POLL_STOP = 'POLL_STOP';

export function alertSuccess(text: string) {
  return { type: ALERT_SUCCESS, text };
}
export function alertError(text: string) {
  return { type: ALERT_ERROR, text };
}
export function alertClear() {
  return { type: ALERT_CLEAR };
}

export const updatePollingStats = stats => ({
  type: UPDATE_POLLING_STATS,
});

export const startPolling = (params?: any) => ({
  type: POLL_START,
  params,
});

export const stopPolling = () => ({
  type: POLL_STOP,
});
