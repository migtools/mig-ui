export const PollingActionTypes = {
  PLAN_POLL_START: 'PLAN_POLL_START',
  PLAN_POLL_STOP: 'PLAN_POLL_STOP',
  STORAGE_POLL_START: 'STORAGE_POLL_START',
  STORAGE_POLL_STOP: 'STORAGE_POLL_STOP',
  CLUSTER_POLL_START: 'CLUSTER_POLL_START',
  CLUSTER_POLL_STOP: 'CLUSTER_POLL_STOP',
  STATUS_POLL_START: 'STATUS_POLL_START',
  STATUS_POLL_STOP: 'STATUS_POLL_STOP',
};

const startPlanPolling = (params?: any) => ({
  type: PollingActionTypes.PLAN_POLL_START,
  params,
});

const stopPlanPolling = () => ({
  type: PollingActionTypes.PLAN_POLL_STOP,
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
  startPlanPolling,
  stopPlanPolling,
  startClusterPolling,
  stopClusterPolling,
  startStoragePolling,
  stopStoragePolling,
  startStatusPolling,
  stopStatusPolling
};
