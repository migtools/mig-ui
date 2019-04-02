import { Creators as AlertCreators } from '../../common/duck/actions';
import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import {
  ClusterRegistryResource,
  ClusterRegistryResourceKind,
} from '../../../client/resources';
import { MigResource, MigResourceKind } from '../../../client/resources';

const clusterFetchSuccess = Creators.clusterFetchSuccess;
const addClusterSuccess = Creators.addClusterSuccess;
const removeClusterSuccess = Creators.removeClusterSuccess;
const removeClusterFailure = Creators.removeClusterFailure;

const addCluster = cluster => {
  return (dispatch, getState) => {
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const resource = new ClusterRegistryResource(
        ClusterRegistryResourceKind.Cluster, migMeta.namespace);
      client.create(resource, cluster)
        .then(res => dispatch(addClusterSuccess(res.data)))
        .catch(err => AlertCreators.alertError('Failed to add cluster'));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};

const removeCluster = id => {
  throw new Error('NOT IMPLEMENTED');
  // return dispatch => {
  //   removeClusterRequest(id).then(
  //     response => {
  //       dispatch(removeClusterSuccess(id));
  //       dispatch(fetchClusters());
  //     },
  //     error => {
  //       dispatch(removeClusterFailure(error));
  //     },
  //   );
  // };
};

const fetchClusters = () => {
  return (dispatch, getState) => {
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const resource = new MigResource(
        MigResourceKind.MigCluster, migMeta.namespace);
      client.list(resource)
        .then(res => dispatch(clusterFetchSuccess(res.data.items)))
        .catch(err => AlertCreators.alertError('Failed to get clusters'));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};

export default {
  fetchClusters,
  addCluster,
  removeCluster,
};
