export const ALERT_SUCCESS = 'ALERT_SUCCESS';
export const ALERT_ERROR = 'ALERT_ERROR';
export const ALERT_CLEAR = 'ALERT_CLEAR';

export function alertSuccess(text) {
  return { type: ALERT_SUCCESS, text };
}
export function alertError(text) {
  return { type: ALERT_ERROR, text };
}
export function alertClear() {
  return { type: ALERT_CLEAR };
}
