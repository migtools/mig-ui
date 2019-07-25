export const startDataListPolling = (params?: any) => ({
  type: 'DATA_LIST_POLL_START',
  params,
});

export const stopDataListPolling = () => ({
  type: 'DATA_LIST_POLL_STOP',
});

export const startStoragePolling = (params?: any) => ({
  type: 'STORAGE_POLL_START',
  params,
});

export const stopStoragePolling = () => ({
  type: 'STORAGE_POLL_STOP',
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
