export const PollingActionTypes = {
  DATA_LIST_POLL_START: 'DATA_LIST_POLL_START',
  DATA_LIST_POLL_STOP: 'DATA_LIST_POLL_STOP',
  STORAGE_POLL_START: 'STORAGE_POLL_START',
  STORAGE_POLL_STOP: 'STORAGE_POLL_STOP',
  CLUSTER_POLL_START: 'CLUSTER_POLL_START',
  CLUSTER_POLL_STOP: 'CLUSTER_POLL_STOP',
  STATUS_POLL_START: 'STATUS_POLL_START',
  STATUS_POLL_STOP: 'STATUS_POLL_STOP',
};

const startDataListPolling = (params?: any) => ({
  type: PollingActionTypes.DATA_LIST_POLL_START,
  params,
});

const stopDataListPolling = () => ({
  type: PollingActionTypes.DATA_LIST_POLL_STOP,
});

const startStoragePolling = (params?: any) => ({
  type: PollingActionTypes.STORAGE_POLL_START,
  params,
});

const stopStoragePolling = () => ({
  type: PollingActionTypes.STORAGE_POLL_STOP,
});

const startClusterPolling = (params?: any) => ({
  type: PollingActionTypes.CLUSTER_POLL_START,
  params,
});

const stopClusterPolling = () => ({
  type: PollingActionTypes.CLUSTER_POLL_STOP,
});

const startStatusPolling = (params?: any) => ({
  type: PollingActionTypes.STATUS_POLL_START,
  params,
});

const stopStatusPolling = () => ({
  type: PollingActionTypes.STATUS_POLL_STOP,
});

export const PollingActions = {
  startDataListPolling,
  stopDataListPolling,
  startClusterPolling,
  stopClusterPolling,
  startStoragePolling,
  stopStoragePolling,
  startStatusPolling,
  stopStatusPolling
};
