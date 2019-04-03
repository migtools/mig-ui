import { Creators as AlertCreators } from '../../common/duck/actions';
import { Creators } from './actions';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import {
  CoreClusterResource,
  CoreClusterResourceKind,
} from '../../../client/resources'

const migPlanFetchSuccess = Creators.migPlanFetchSuccess;
const addPlanSuccess = Creators.addPlanSuccess;
const addPlanFailure = Creators.addPlanFailure;
const removePlanSuccess = Creators.removePlanSuccess;
const removePlanFailure = Creators.removePlanFailure;
const sourceClusterNamespacesFetchSuccess = Creators.sourceClusterNamespacesFetchSuccess;

const addPlan = migPlan => {
  return (dispatch, getState) => {
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const resource = new MigResource(
        MigResourceKind.MigPlan,
        migMeta.namespace,
      );
      client
        .create(resource, migPlan)
        .then(res => dispatch(addPlanSuccess(res.data)))
        .catch(err => AlertCreators.alertError('Failed to add plan'));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};

const removePlan = id => {
  throw new Error('NOT IMPLEMENTED');
  // return dispatch => {
  //   removeStorageRequest(id).then(
  //     response => {
  //       dispatch(removeStorageSuccess(id));
  //       dispatch(fetchStorage());
  //     },
  //     error => {
  //       dispatch(removeStorageFailure(error));
  //     },
  //   );
  // };
};

const fetchPlan = () => {
  return (dispatch, getState) => {
    try {
      const { migMeta } = getState();
      const client: IClusterClient = ClientFactory.hostCluster(getState());
      const resource = new MigResource(
        MigResourceKind.MigPlan,
        migMeta.namespace,
      );
      client
        .list(resource)
        .then(res => dispatch(migPlanFetchSuccess(res.data)))
        .catch(err => AlertCreators.alertError('Failed to get plans'));
    } catch (err) {
      dispatch(AlertCreators.alertError(err));
    }
  };
};

const fetchNamespacesForCluster = (clusterName) => {
  return (dispatch, getState) => {
    const client: IClusterClient = ClientFactory.forCluster(clusterName, getState());
    const nsResource = new CoreClusterResource(CoreClusterResourceKind.Namespace)
    client.list(nsResource).then(res => {
      dispatch(sourceClusterNamespacesFetchSuccess(res.data.items));
    }).catch(err => AlertCreators.alertError('Failed to load namespaces for cluster'));
  };
};

export default {
  fetchPlan,
  addPlan,
  removePlan,
  fetchNamespacesForCluster,
};
