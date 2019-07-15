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

export const getClusterUpdatedStatus = (updatedCluster, originalCluster) => {
  const statusObj = { success: null, error: null };
  //TODO: need to figure out a way to check prevControllerState !== currentController state when updating the
  //cluster objects
  //hardcoding the poll status check to true here for now

  statusObj.success = true;

  if (updatedCluster.MigCluster.status) {
    // const hasUpdatedReadyCondition = !!updatedCluster.MigCluster.status.conditions.some(
    //   c => c.type === 'Ready'
    // );
    // const updatedReadyCondition = updatedCluster.MigCluster.status.conditions
    //   .filter(c => c.type === 'Ready')
    //   .pop();
    // const originalReadyCondition = originalCluster.status.conditions
    //   .filter(c => c.type === 'Ready')
    //   .pop();
    // if (
    //   hasUpdatedReadyCondition &&
    //   updatedReadyCondition.lastTransitionTime !== originalReadyCondition.lastTransitionTime
    // ) {
    //   statusObj.success = true;
    // }
  }
  return statusObj;
};
