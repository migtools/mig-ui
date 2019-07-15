export const getClusterStatus = cluster => {
  const statusObj = { success: null, error: null };
  if (cluster.MigCluster.status) {
    const hasReadyCondition = !!cluster.MigCluster.status.conditions.some(c => c.type === 'Ready');
    const hasConnectionFailedCondition = !!cluster.MigCluster.status.conditions.some(
      c => c.type === 'TestConnectFailed'
    );
    if (hasReadyCondition) {
      statusObj.success = hasReadyCondition;
    }
    if (hasConnectionFailedCondition) {
      statusObj.error = hasConnectionFailedCondition;
    }
  }
  return statusObj;
};
