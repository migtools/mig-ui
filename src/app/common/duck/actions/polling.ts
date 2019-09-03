export const PollingActionTypes = {
  STATUS_POLL_START: 'STATUS_POLL_START',
  STATUS_POLL_STOP: 'STATUS_POLL_STOP',
};


const startStatusPolling = (params?: any) => ({
  type: PollingActionTypes.STATUS_POLL_START,
  params,
});

const stopStatusPolling = () => ({
  type: PollingActionTypes.STATUS_POLL_STOP,
});

export const PollingActions = {
  startStatusPolling,
  stopStatusPolling,
};
