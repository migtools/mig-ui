import { createActions } from 'reduxsauce';
import { IAddEditStatus } from '../../common/add_edit_state';

const { Creators, Types } = createActions({
  clusterFetchSuccess: ['clusterList'],
  clusterFetchRequest: [],
  clusterFetchFailure: [],
  updateClusters: ['updatedClusters'],
  addClusterRequest: ['clusterValues'],
  addClusterSuccess: ['newCluster'],
  addClusterFailure: ['error'],
  removeClusterSuccess: ['name'],
  updateClusterRequest: ['clusterValues'],
  updateClusterSuccess: ['updatedCluster'],
  setIsPollingCluster: ['isPolling'],
  watchClusterAddEditStatus: ['clusterName'],
  cancelWatchClusterAddEditStatus: [],
});


Types.SET_CLUSTER_ADD_EDIT_STATUS = 'SET_CLUSTER_ADD_EDIT_STATUS';
Creators.setClusterAddEditStatus = (status: IAddEditStatus) => {
  return {
    type: Types.SET_CLUSTER_ADD_EDIT_STATUS,
    status,
  };
};

export { Creators, Types };
