import { takeLatest, select, race, take, call, put, delay, } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import {
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
} from '../../../client/resources';
import {
  createTokenSecret,
  createMigCluster,
  updateTokenSecret,
  getTokenSecretLabelSelector,
} from '../../../client/resources/conversions';

import { ClusterActions, ClusterActionTypes } from './actions';
import { AlertActions } from '../../common/duck/actions';
import {
  createAddEditStatus,
  AddEditState,
  AddEditMode,
  IAddEditStatus,
  AddEditWatchTimeout,
  AddEditWatchTimeoutPollInterval,
  AddEditConditionCritical,
  createAddEditStatusWithMeta,
  AddEditConditionReady,
  AddEditDebounceWait,
} from '../../common/add_edit_state';
import Q from 'q';

function fetchMigClusterRefs(client: IClusterClient, migMeta, migClusters): Array<Promise<any>> {
  const refs: Array<Promise<any>> = [];

  migClusters.forEach(cluster => {
    const secretRef = cluster.spec.serviceAccountSecretRef;
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      secretRef.namespace
    );
    refs.push(client.get(secretResource, secretRef.name));
  });

  return refs;
}

function groupClusters(migClusters: any[], refs: any[]): any[] {
  return migClusters.map(mc => {
    const fullCluster = {
      MigCluster: mc,
    };

    if (!mc.spec.isHostCluster) {
      fullCluster['Secret'] = refs.find(
        i => i.data.kind === 'Secret' && i.data.metadata.name === mc.spec.serviceAccountSecretRef.name
      ).data;
    }

    return fullCluster;
  });
}

function* fetchClustersGenerator() {
  const state = yield select();
  const client: IClusterClient = ClientFactory.cluster(state);
  const resource = new MigResource(MigResourceKind.MigCluster, state.migMeta.namespace);
  try {
    let clusterList = yield client.list(resource);
    clusterList = yield clusterList.data.items;
    const nonHostClusters = clusterList.filter(c => !c.spec.isHostCluster);
    const refs = yield Promise.all(fetchMigClusterRefs(client, state.migMeta, nonHostClusters));
    const groupedClusters = groupClusters(clusterList, refs);
    return { updatedClusters: groupedClusters, isSuccessful: true };
  } catch (e) {
    return { e, isSuccessful: false };
  }
}

function* removeClusterSaga(action) {
  try {
    const state = yield select();
    const { migMeta } = state;
    const { name } = action;
    const client: IClusterClient = ClientFactory.cluster(state);

    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      migMeta.configNamespace
    );
    const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);
    
    const secretResourceList = yield client.list(secretResource, getTokenSecretLabelSelector(MigResourceKind.MigCluster, name))

    const secretResourceName = secretResourceList.data.items[0].metadata.name;

    yield Promise.all([
      client.delete(secretResource, secretResourceName),
      client.delete(migClusterResource, name),
    ]);

    yield put(ClusterActions.removeClusterSuccess(name));
    yield put(AlertActions.alertSuccessTimeout(`Successfully removed cluster "${name}"!`));
  } catch (err) {
    yield put(AlertActions.alertErrorTimeout(err));
    yield put(ClusterActions.removeClusterFailure(err));
  }
}

function* addClusterRequest(action) {
  const state = yield select();
  const { migMeta } = state;
  const { clusterValues } = action;
  const client: IClusterClient = ClientFactory.cluster(state);

  const tokenSecret = createTokenSecret(
    clusterValues.name,
    migMeta.configNamespace,
    clusterValues.token,
    MigResourceKind.MigCluster,
    clusterValues.name
  );

  const migCluster = createMigCluster(
    clusterValues.name,
    migMeta.namespace,
    clusterValues.url,
    tokenSecret,
    clusterValues.isAzure,
    clusterValues.azureResourceGroup,
    clusterValues.requireSSL,
    clusterValues.caBundle
  );

  const secretResource = new CoreNamespacedResource(
    CoreNamespacedResourceKind.Secret,
    migMeta.configNamespace
  );
  const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);

  // Ensure that none of objects that make up a cluster already exist
  try {
    const getResults = yield Q.allSettled([
      client.list(secretResource, getTokenSecretLabelSelector(MigResourceKind.MigCluster, migCluster.metadata.name)),
      client.get(migClusterResource, migCluster.metadata.name),
    ]);;

    const alreadyExists = getResults.reduce((exists, res) => {
      return res && res.status === 200 ?
        [...exists, { kind: res.value.data.kind, 
          name: res.value.data.items[0].metadata.name ? res.value.data.items && 
          res.value.data.items.length > 0 : res.value.data.metadata.name
        }] :
        exists;
    }, []);

    if (alreadyExists.length > 0) {
      throw new Error(alreadyExists.reduce((msg, v) => {
        return msg + `- kind: "${v.kind}", name: "${v.name}"`;
      }, 'Some cluster objects already exist '));
    }
  } catch (err) {
    console.error(err.message);
    yield put(ClusterActions.setClusterAddEditStatus(createAddEditStatusWithMeta(
      AddEditState.Critical,
      AddEditMode.Add,
      err.message,
      '',
    )));
    return;
  }

  // None of the objects already exist, so try to create all of the objects
  // If any of the objects actually fail creation, we need to rollback the others
  // so the clusters are created, or fail atomically
  try {
    const clusterAddResults = [];
    const tokenSecretAddResult = yield client.create(secretResource, tokenSecret);

    if (tokenSecretAddResult.status === 201) {
      clusterAddResults.push(tokenSecretAddResult);

      Object.assign(migCluster.spec.serviceAccountSecretRef, { 
        name: tokenSecretAddResult.data.metadata.name,
        namespace: tokenSecretAddResult.data.metadata.namespace,
        });

      const clusterAddResult = yield client.create(migClusterResource, migCluster);
      if (clusterAddResult.status === 201) {
        clusterAddResults.push(clusterAddResult);
      }
    }

    // If any of the attempted object creation promises have failed, we need to
    // rollback those that succeeded so we don't have a halfway created "Cluster"
    // A rollback is only required if some objects have actually *succeeded*,
    // as well as failed.
    const isRollbackRequired = 
      clusterAddResults.find(res => res.status === 201) &&
      clusterAddResults.find(res => res.status !== 201)

    if (isRollbackRequired) {
      const kindToResourceMap = {
        MigCluster: migClusterResource,
        Secret: secretResource,
      };

      // The objects that need to be rolled back are those that were fulfilled
      const rollbackObjs = clusterAddResults.reduce((rollbackAccum, res) => {
        return res.status === 201 ?
          [...rollbackAccum, { kind: res.data.kind, name: res.data.metadata.name }] :
          rollbackAccum;
      }, []);

      const rollbackResults = yield Q.allSettled(rollbackObjs.map(r => {
        return client.delete(kindToResourceMap[r.kind], r.name);
      }));

      // Something went wrong with rollback, not much we can do at this point
      // except inform the user about what's gone wrong so they can take manual action
      if (rollbackResults.find(res => res.state === 'rejected')) {
        throw new Error(rollbackResults.reduce((msg, r) => {
          const kind = r.reason.request.response.kind;
          const name = r.reason.request.response.details.name;
          return msg + `- kind: ${kind}, name: ${name}`;
        }, 'Attempted to rollback objects, but failed '));
      } else {
        // One of the objects failed, but rollback was successful. Need to alert
        // the user that something went wrong, but we were able to recover with
        // a rollback
        throw Error(clusterAddResults.find(res => res.state === 'rejected').reason);
      }
    } // End rollback handling

    const cluster = clusterAddResults.reduce((accum, res) => {
      const data = res.data;
      accum[data.kind] = data;
      return accum;
    }, {});

    yield put(ClusterActions.addClusterSuccess(cluster));

    // Push into watching state
    yield put(ClusterActions.setClusterAddEditStatus(
      createAddEditStatus(AddEditState.Watching, AddEditMode.Edit),
    ));
    yield put(ClusterActions.watchClusterAddEditStatus(clusterValues.name));
  } catch (err) {
    console.error('Cluster failed creation with error: ', err);
    put(AlertActions.alertErrorTimeout('Cluster failed creation'));
    return;
  }
}

function* watchAddClusterRequest() {
  yield takeLatest(ClusterActionTypes.ADD_CLUSTER_REQUEST, addClusterRequest);
}

function* updateClusterRequest(action) {
  // TODO: Probably need rollback logic here too if any fail
  const state = yield select();
  const { migMeta } = state;
  const { clusterValues } = action;
  const client: IClusterClient = ClientFactory.cluster(state);

  const currentCluster = state.cluster.clusterList.find(c => {
    return c.MigCluster.metadata.name === clusterValues.name;
  });

  const currentUrl = currentCluster.MigCluster.spec.url;
  const urlUpdated = clusterValues.url !== currentUrl;

  // NOTE: Need to decode the b64 token
  const currentToken = atob(currentCluster.Secret.data.saToken);
  const tokenUpdated = clusterValues.token !== currentToken;

  const currentAzureResource = currentCluster.MigCluster.spec.azureResourceGroup;
  const azureUpdated = clusterValues.azureResourceGroup !== currentAzureResource ||
    clusterValues.isAzure !== currentAzureResource.length > 0;

  const currentRequireSSL = !currentCluster.MigCluster.spec.insecure;
  const requireSSLUpdated = clusterValues.requireSSL !== currentRequireSSL;

  const currentCABundle = currentCluster.MigCluster.spec.caBundle;
  const caBundleUpdated = clusterValues.caBundle !== currentCABundle;

  if (!urlUpdated && !tokenUpdated && !azureUpdated && !requireSSLUpdated && !caBundleUpdated) {
    console.warn('A cluster update was requested, but nothing was changed');
    return;
  }

  const updatePromises = [];
  const aggregatedPatch = { spec: {} };

  if (urlUpdated) {
    aggregatedPatch.spec['url'] = clusterValues.url;
  }

  if (azureUpdated) {
    if (clusterValues.isAzure) {
      aggregatedPatch.spec['azureResourceGroup'] = clusterValues.azureResourceGroup;
    } else {
      aggregatedPatch.spec['azureResourceGroup'] = '';
    }
  }

  if (requireSSLUpdated) {
    aggregatedPatch.spec['insecure'] = !clusterValues.requireSSL;
  }
  if (caBundleUpdated) {
    aggregatedPatch.spec['caBundle'] = clusterValues.caBundle || null;
  }

  if (urlUpdated || azureUpdated || requireSSLUpdated || caBundleUpdated) {
    const migClusterResource = new MigResource(
      MigResourceKind.MigCluster, migMeta.namespace);
    // Pushing a request fn to delay the call until its yielded in a batch at same time
    updatePromises.push(() => client.patch(
      migClusterResource, clusterValues.name, aggregatedPatch));
  }

  if (tokenUpdated) {
    const newTokenSecret = updateTokenSecret(clusterValues.token);
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      migMeta.configNamespace,
    );

    // Pushing a request fn to delay the call until its yielded in a batch at same time
    updatePromises.push(() => client.patch(
      secretResource, currentCluster.spec.serviceAccountSecretRef.name, newTokenSecret));
  }

  try {
    // Convert reqfns to promises, executing the requsts in the process
    // Then yield a wrapper all promise to the saga middleware and wait
    // on the results
    const results = yield Promise.all(updatePromises.map(reqfn => reqfn()));

    const groupedResults = results.reduce((accum, res) => {
      accum[res.data.kind] = res.data;
      return accum;
    }, {});

    // Need to merge the grouped results onto the currentCluster since
    // its possible the grouped results was only a partial update
    // Ex: could have just been a Cluster or a Secret
    const updatedCluster = { ...currentCluster, ...groupedResults };

    // Update the state tree with the updated cluster, and start to watch
    // again to check for its condition after edits
    yield put(ClusterActions.updateClusterSuccess(updatedCluster));
    yield put(ClusterActions.setClusterAddEditStatus(
      createAddEditStatus(AddEditState.Watching, AddEditMode.Edit),
    ));
    yield put(ClusterActions.watchClusterAddEditStatus(clusterValues.name));
  } catch (err) {
    console.error('NOT IMPLEMENTED: An error occurred during updateClusterRequest:', err);
    // TODO: What are we planning on doing in the event of an update failure?
    // TODO: We probably even need retry logic here...
  }
}

function* watchUpdateClusterRequest() {
  yield takeLatest(ClusterActionTypes.UPDATE_CLUSTER_REQUEST, updateClusterRequest);
}

function* pollClusterAddEditStatus(action) {
  // Give the controller some time to bounce
  yield delay(AddEditDebounceWait);
  while (true) {
    try {
      const state = yield select();
      const { migMeta } = state;
      const { clusterName } = action;

      const client: IClusterClient = ClientFactory.cluster(state);
      const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);
      const clusterPollResult = yield client.get(migClusterResource, clusterName);

      const hasStatusAndConditions =
        clusterPollResult.data.status &&
        clusterPollResult.data.status.conditions;

      if (hasStatusAndConditions) {
        const criticalCond = clusterPollResult.data.status.conditions.find(cond => {
          return cond.category === AddEditConditionCritical;
        });

        if (criticalCond) {
          return createAddEditStatusWithMeta(
            AddEditState.Critical,
            AddEditMode.Edit,
            criticalCond.message,
            criticalCond.reason,
          );
        }

        const readyCond = clusterPollResult.data.status.conditions.find(cond => {
          return cond.type === AddEditConditionReady;
        });

        if (readyCond) {
          return createAddEditStatusWithMeta(
            AddEditState.Ready,
            AddEditMode.Edit,
            readyCond.message,
            '', // Ready has no reason
          );
        }
      }

      // No conditions found, let's wait a bit and keep checking
      yield delay(AddEditWatchTimeoutPollInterval);
    } catch (err) {
      // TODO: what happens when the poll fails? Back into that hard error state?
      console.error('Hard error branch hit in poll cluster add edit', err);
      return;
    }
  }
}

function* startWatchingClusterAddEditStatus(action) {
  // Start a race, poll until the watch is cancelled (by closing the modal),
  // polling times out, or the condition is added, in that order of precedence.
  const raceResult = yield race({
    addEditResult: call(pollClusterAddEditStatus, action),
    timeout: delay(AddEditWatchTimeout),
    cancel: take(ClusterActionTypes.CANCEL_WATCH_CLUSTER_ADD_EDIT_STATUS),
  });

  if (raceResult.cancel) {
    return;
  }

  const addEditResult: IAddEditStatus = raceResult.addEditResult;

  const statusToDispatch = addEditResult || createAddEditStatus(
    AddEditState.TimedOut, AddEditMode.Edit);

  yield put(ClusterActions.setClusterAddEditStatus(statusToDispatch));
}

function* watchClusterAddEditStatus() {
  yield takeLatest(ClusterActionTypes.WATCH_CLUSTER_ADD_EDIT_STATUS, startWatchingClusterAddEditStatus);
}

function* watchRemoveClusterRequest() {
  yield takeLatest(ClusterActionTypes.REMOVE_CLUSTER_REQUEST, removeClusterSaga);
}

export default {
  watchRemoveClusterRequest,
  watchAddClusterRequest,
  watchUpdateClusterRequest,
  watchClusterAddEditStatus,
  fetchClustersGenerator
};
