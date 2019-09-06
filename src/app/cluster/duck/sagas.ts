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
  updateMigClusterUrl,
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

function* addClusterRequest(action) {
  const state = yield select();
  const { migMeta } = state;
  const { clusterValues } = action;
  const client: IClusterClient = ClientFactory.hostCluster(state);

  const tokenSecret = createTokenSecret(
    clusterValues.name,
    migMeta.configNamespace,
    clusterValues.token
  );
  const migCluster = createMigCluster(
    clusterValues.name,
    migMeta.namespace,
    clusterValues.url,
    tokenSecret
  );

  const secretResource = new CoreNamespacedResource(
    CoreNamespacedResourceKind.Secret,
    migMeta.configNamespace
  );
  const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);

  // Ensure that none of objects that make up a cluster already exist
  try {
    const getResults = yield Q.allSettled([
      client.get(secretResource, tokenSecret.metadata.name),
      client.get(migClusterResource, migCluster.metadata.name),
    ]);

    const alreadyExists = getResults.reduce((exists, res) => {
      return res.value && res.value.status === 200 ?
        [...exists, { kind: res.value.data.kind, name: res.value.data.metadata.name }] :
        exists;
    }, []);

    if(alreadyExists.length > 0) {
      throw new Error(alreadyExists.reduce((msg, v) => {
        return msg + `- kind: "${v.kind}", name: "${v.name}"`;
      }, 'Some cluster objects already exist '));
    }
  } catch(err) {
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
    const clusterAddResults = yield Q.allSettled([
      client.create(secretResource, tokenSecret),
      client.create(migClusterResource, migCluster),
    ]);

    // If any of the attempted object creation promises have failed, we need to
    // rollback those that succeeded so we don't have a halfway created "Cluster"
    // A rollback is only required if some objects have actually *succeeded*,
    // as well as failed.
    const isRollbackRequired =
      clusterAddResults.find(res => res.state === 'rejected') &&
      clusterAddResults.find(res => res.state === 'fulfilled');

    if(isRollbackRequired) {
      const kindToResourceMap = {
        MigCluster: migClusterResource,
        Secret: secretResource,
      };

      // The objects that need to be rolled back are those that were fulfilled
      const rollbackObjs = clusterAddResults.reduce((rollbackAccum, res) => {
        return res.state === 'fulfilled' ?
          [...rollbackAccum, { kind: res.value.data.kind, name: res.value.data.metadata.name }] :
          rollbackAccum;
      }, []);

      const rollbackResults = yield Q.allSettled(rollbackObjs.map(r => {
        return client.delete(kindToResourceMap[r.kind], r.name);
      }));

      // Something went wrong with rollback, not much we can do at this point
      // except inform the user about what's gone wrong so they can take manual action
      if(rollbackResults.find(res => res.state === 'rejected')) {
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
      const data = res.value.data;
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
  const client: IClusterClient = ClientFactory.hostCluster(state);

  const currentCluster = state.cluster.clusterList.find(c => {
    return c.MigCluster.metadata.name === clusterValues.name;
  });

  const currentUrl = currentCluster.MigCluster.spec.url;
  const urlUpdated = clusterValues.url !== currentUrl;

  // NOTE: Need to decode the b64 token
  const currentToken = atob(currentCluster.Secret.data.saToken);
  const tokenUpdated = clusterValues.token !== currentToken;

  if (!urlUpdated && !tokenUpdated) {
    console.warn('A cluster update was requested, but nothing was changed');
    return;
  }

  const updatePromises = [];
  if (urlUpdated) {
    const urlUpdatePatch = updateMigClusterUrl(clusterValues.url);
    const migClusterResource = new MigResource(
      MigResourceKind.MigCluster, migMeta.namespace);

    // Pushing a request fn to delay the call until its yielded in a batch at same time
    updatePromises.push(() => client.patch(
      migClusterResource, clusterValues.name, urlUpdatePatch));
  }

  if (tokenUpdated) {
    const newTokenSecret = updateTokenSecret(clusterValues.token);
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      migMeta.configNamespace,
    );
    // Pushing a request fn to delay the call until its yielded in a batch at same time
    updatePromises.push(() => client.patch(
      secretResource, clusterValues.name, newTokenSecret));
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

      const client: IClusterClient = ClientFactory.hostCluster(state);
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

export default {
  watchAddClusterRequest,
  watchUpdateClusterRequest,
  watchClusterAddEditStatus,
};
