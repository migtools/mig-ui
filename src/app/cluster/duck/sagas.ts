import { takeLatest, select, race, take, call, put, delay, } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import {
  ClusterRegistryResource,
  ClusterRegistryResourceKind,
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
} from '../../../client/resources';
import {
  createClusterRegistryObj,
  createTokenSecret,
  createMigCluster,
  updateClusterRegistryObj,
  updateTokenSecret,
} from '../../../client/resources/conversions';

import { Creators } from './actions';
import { alertErrorTimeout } from '../../common/duck/actions';
import {
  createAddEditStatus,
  AddEditState,
  AddEditMode,
  AddEditStatus,
  AddEditWatchTimeout,
  AddEditWatchTimeoutPollInterval,
  AddEditConditionCritical,
  createAddEditStatusWithMeta,
  AddEditConditionReady,
  AddEditDebounceWait,
} from '../../common/add_edit_state';

function* addClusterRequest(action)  {
  // TODO: Need to improve this to fall into the failed create state with rollback
  const state = yield select();
  const { migMeta } = state;
  const { clusterValues } = action;
  const client: IClusterClient = ClientFactory.hostCluster(state);

  const clusterReg = createClusterRegistryObj(
    clusterValues.name,
    migMeta.namespace,
    clusterValues.url
  );
  const tokenSecret = createTokenSecret(
    clusterValues.name,
    migMeta.configNamespace,
    clusterValues.token
  );
  const migCluster = createMigCluster(
    clusterValues.name,
    migMeta.namespace,
    clusterReg,
    tokenSecret
  );

  const clusterRegResource = new ClusterRegistryResource(
    ClusterRegistryResourceKind.Cluster,
    migMeta.namespace
  );
  const secretResource = new CoreNamespacedResource(
    CoreNamespacedResourceKind.Secret,
    migMeta.configNamespace
  );
  const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);

  try {
    const clusterAddResults = yield Promise.all([
      client.create(clusterRegResource, clusterReg),
      client.create(secretResource, tokenSecret),
      client.create(migClusterResource, migCluster),
    ]);

    const cluster = clusterAddResults.reduce((accum, res) => {
      accum[res.data.kind] = res.data;
      return accum;
    }, {});

    yield put(Creators.addClusterSuccess(cluster));

    // Push into watching state
    yield put(Creators.setClusterAddEditStatus(
      createAddEditStatus(AddEditState.Watching, AddEditMode.Edit),
    ));
    yield put(Creators.watchClusterAddEditStatus(clusterValues.name));
  } catch(err) {
    // TODO: Creation failed, should enter failed creation state here
    // Also need to rollback the objects that were successfully created.
    // Could use Promise.allSettled here as well.
    console.error('Cluster failed creation with error: ', err)
    put(alertErrorTimeout('Cluster failed creation'));
  }
}

function* watchAddClusterRequest() {
  yield takeLatest(Creators.addClusterRequest().type, addClusterRequest);
}

function* updateClusterRequest(action)  {
  // TODO: Probably need rollback logic here too if any fail
  const state = yield select();
  const { migMeta } = state;
  const { clusterValues } = action;
  const client: IClusterClient = ClientFactory.hostCluster(state);

  const currentCluster = state.cluster.clusterList.find(c => {
    return c.MigCluster.metadata.name === clusterValues.name;
  });

  const currentUrl = currentCluster.Cluster.spec.kubernetesApiEndpoints.serverEndpoints[0].serverAddress;
  const urlUpdated = clusterValues.url !== currentUrl;

  // NOTE: Need to decode the b64 token
  const currentToken = atob(currentCluster.Secret.data.saToken);
  const tokenUpdated = clusterValues.token !== currentToken;

  if(!urlUpdated && !tokenUpdated) {
    console.warn('A cluster update was requested, but nothing was changed');
    return;
  }

  const updatePromises = [];
  if(urlUpdated) {
    const newClusterReg = updateClusterRegistryObj(clusterValues.url);
    const clusterRegResource = new ClusterRegistryResource(
      ClusterRegistryResourceKind.Cluster,
      migMeta.namespace,
    )
    // Pushing a request fn to delay the call until its yielded in a batch at same time
    updatePromises.push(() => client.patch(
      clusterRegResource, clusterValues.name, newClusterReg));
  }

  if(tokenUpdated) {
    const newTokenSecret = updateTokenSecret(clusterValues.token);
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      migMeta.configNamespace,
    )
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
    yield put(Creators.updateClusterSuccess(updatedCluster));
    yield put(Creators.setClusterAddEditStatus(
      createAddEditStatus(AddEditState.Watching, AddEditMode.Edit),
    ));
    yield put(Creators.watchClusterAddEditStatus(clusterValues.name));
  } catch(err) {
    console.log('NOT IMPLEMENTED: An error occurred during updateClusterRequest:', err);
    // TODO: What are we planning on doing in the event of an update failure?
    // TODO: We probably even need retry logic here...
  }
}

function* watchUpdateClusterRequest() {
  yield takeLatest(Creators.updateClusterRequest().type, updateClusterRequest);
}

function* pollClusterAddEditStatus(action) {
  // Give the controller some time to bounce
  yield delay(AddEditDebounceWait);
  while(true) {
    try {
      const state = yield select();
      const { migMeta } = state;
      const { clusterName } = action;

      const client: IClusterClient = ClientFactory.hostCluster(state);
      const migClusterResource = new MigResource(MigResourceKind.MigCluster, migMeta.namespace);
      const clusterPollResult = yield client.get(migClusterResource, clusterName);

      const criticalCond = clusterPollResult.data.status.conditions.find(cond => {
        return cond.category === AddEditConditionCritical;
      })

      if(criticalCond) {
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

      if(readyCond) {
        return createAddEditStatusWithMeta(
          AddEditState.Ready,
          AddEditMode.Edit,
          readyCond.message,
          '', // Ready has no reason
        );
      }

      // No conditions found, let's wait a bit and keep checking
      yield delay(AddEditWatchTimeoutPollInterval);
    } catch(err) {
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
    cancel: take(Creators.cancelWatchClusterAddEditStatus().type),
  });

  if(raceResult.cancel) {
    return;
  }

  const addEditResult: AddEditStatus = raceResult.addEditResult;

  const statusToDispatch = addEditResult || createAddEditStatus(
    AddEditState.TimedOut, AddEditMode.Edit);

  yield put(Creators.setClusterAddEditStatus(statusToDispatch));
}

function* watchClusterAddEditStatus() {
  yield takeLatest(Creators.watchClusterAddEditStatus().type, startWatchingClusterAddEditStatus);
}

export default {
  watchAddClusterRequest,
  watchUpdateClusterRequest,
  watchClusterAddEditStatus,
};
