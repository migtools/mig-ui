import { takeLatest, select, race, take, call, put, delay, } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import {
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
} from '../../../client/resources';
import {
  createStorageSecret,
  createMigStorage,
  updateMigStorage,
  updateStorageSecret,
} from '../../../client/resources/conversions';
import { StorageActions, StorageActionTypes } from './actions';
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

function* addStorageRequest(action) {
  // TODO: Need to improve this to fall into the failed create state with rollback
  const state = yield select();
  const { migMeta } = state;
  const { storageValues } = action;
  const client: IClusterClient = ClientFactory.hostCluster(state);

  const storageSecret = createStorageSecret(
    storageValues.name,
    migMeta.configNamespace,
    storageValues.secret,
    storageValues.accessKey,
  );

  const migStorage = createMigStorage(
    storageValues.name,
    storageValues.bucketName,
    storageValues.bucketRegion,
    migMeta.namespace,
    storageSecret,
  );

  const secretResource = new CoreNamespacedResource(
    CoreNamespacedResourceKind.Secret,
    migMeta.configNamespace
  );
  const migStorageResource = new MigResource(
    MigResourceKind.MigStorage, migMeta.namespace);

  try {
    const storageAddResults = yield Promise.all([
      client.create(secretResource, storageSecret),
      client.create(migStorageResource, migStorage),
    ]);

    const storage = storageAddResults.reduce((accum, res) => {
      accum[res.data.kind] = res.data;
      return accum;
    }, {});

    yield put(StorageActions.addStorageSuccess(storage));

    // Push into watching state
    yield put(StorageActions.setStorageAddEditStatus(
      createAddEditStatus(AddEditState.Watching, AddEditMode.Edit),
    ));
    yield put(StorageActions.watchStorageAddEditStatus(storageValues.name));
  } catch (err) {
    // TODO: Creation failed, should enter failed creation state here
    // Also need to rollback the objects that were successfully created.
    // Could use Promise.allSettled here as well.
    console.error('Storage failed creation with error: ', err);
    put(AlertActions.alertErrorTimeout('Storage failed creation'));
  }
}

function* watchAddStorageRequest() {
  yield takeLatest(StorageActionTypes.ADD_STORAGE_REQUEST, addStorageRequest);
}

const accessKeyIdSecretField = 'aws-access-key-id';
const secretAccessKeySecretField = 'aws-secret-access-key';

function* updateStorageRequest(action) {
  // TODO: Probably need rollback logic here too if any fail
  const state = yield select();
  const { migMeta } = state;
  const { storageValues } = action;
  const client: IClusterClient = ClientFactory.hostCluster(state);

  const currentStorage = state.storage.migStorageList.find(c => {
    return c.MigStorage.metadata.name === storageValues.name;
  });

  // Check to see if any fields on the MigStorage were updated
  const currentBucketName =
    currentStorage.MigStorage.spec.backupStorageConfig.awsBucketName;
  const bucketNameUpdated = storageValues.bucketName !== currentBucketName;
  const currentRegion =
    currentStorage.MigStorage.spec.backupStorageConfig.awsRegion;
  const regionUpdated = storageValues.bucketRegion !== currentRegion;
  const migStorageUpdated = bucketNameUpdated || regionUpdated;

  // Check to see if any fields on the kube secret were updated
  // NOTE: Need to decode the b64 token off a k8s secret
  const currentAccessKey = atob(currentStorage.Secret.data[accessKeyIdSecretField]);
  const accessKeyUpdated = storageValues.accessKey !== currentAccessKey;
  const currentSecret = atob(currentStorage.Secret.data[secretAccessKeySecretField]);
  const secretUpdated = storageValues.secret !== currentSecret;
  const kubeSecretUpdated = accessKeyUpdated || secretUpdated;

  if (!migStorageUpdated && !kubeSecretUpdated) {
    console.warn('A storage update was requested, but nothing was changed');
    return;
  }

  const updatePromises = [];
  if (migStorageUpdated) {
    const updatedMigStorage = updateMigStorage(
      storageValues.bucketName, storageValues.bucketRegion);
    const migStorageResource = new MigResource(
      MigResourceKind.MigStorage, migMeta.namespace);

    // Pushing a request fn to delay the call until its yielded in a batch at same time
    updatePromises.push(() => client.patch(
      migStorageResource, storageValues.name, updatedMigStorage));
  }

  if (kubeSecretUpdated) {
    const updatedSecret = updateStorageSecret(storageValues.secret, storageValues.accessKey);
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret, migMeta.configNamespace);

    // Pushing a request fn to delay the call until its yielded in a batch at same time
    updatePromises.push(() => client.patch(
      secretResource, storageValues.name, updatedSecret));
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

    // Need to merge the grouped results onto the currentStorage since
    // its possible the grouped results was only a partial update
    // Ex: could have just been a MigStorage or a Secret
    const updatedStorage = { ...currentStorage, ...groupedResults };

    // Update the state tree with the updated storage, and start to watch
    // again to check for its condition after edits
    yield put(StorageActions.updateStorageSuccess(updatedStorage));
    yield put(StorageActions.setStorageAddEditStatus(
      createAddEditStatus(AddEditState.Watching, AddEditMode.Edit),
    ));
    yield put(StorageActions.watchStorageAddEditStatus(storageValues.name));
  } catch (err) {
    console.error('NOT IMPLEMENTED: An error occurred during updateStorageRequest:', err);
    // TODO: What are we planning on doing in the event of an update failure?
    // TODO: We probably even need retry logic here...
  }
}

function* watchUpdateStorageRequest() {
  yield takeLatest(StorageActionTypes.UPDATE_STORAGE_REQUEST, updateStorageRequest);
}

function* pollStorageAddEditStatus(action) {
  // Give the controller some time to bounce
  yield delay(AddEditDebounceWait);
  while (true) {
    try {
      const state = yield select();
      const { migMeta } = state;
      const { storageName } = action;

      const client: IClusterClient = ClientFactory.hostCluster(state);
      const migStorageResource = new MigResource(
        MigResourceKind.MigStorage, migMeta.namespace);
      const storagePollResult = yield client.get(migStorageResource, storageName);

      const hasStatusAndConditions =
        storagePollResult.data.status &&
        storagePollResult.data.status.conditions;

      if (hasStatusAndConditions) {
        const criticalCond = storagePollResult.data.status.conditions.find(cond => {
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

        const readyCond = storagePollResult.data.status.conditions.find(cond => {
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
      console.error('Hard error branch hit in poll storage add edit', err);
      return;
    }
  }
}

function* startWatchingStorageAddEditStatus(action) {
  // Start a race, poll until the watch is cancelled (by closing the modal),
  // polling times out, or the condition is added, in that order of precedence.
  const raceResult = yield race({
    addEditResult: call(pollStorageAddEditStatus, action),
    timeout: delay(AddEditWatchTimeout),
    cancel: take(StorageActions.cancelWatchStorageAddEditStatus().type),
  });

  if (raceResult.cancel) {
    return;
  }

  const addEditResult: IAddEditStatus = raceResult.addEditResult;

  const statusToDispatch = addEditResult || createAddEditStatus(
    AddEditState.TimedOut, AddEditMode.Edit);

  yield put(StorageActions.setStorageAddEditStatus(statusToDispatch));
}

function* watchStorageAddEditStatus() {
  yield takeLatest(
    StorageActionTypes.WATCH_STORAGE_ADD_EDIT_STATUS,
    startWatchingStorageAddEditStatus
  );
}

export default {
  watchAddStorageRequest,
  watchUpdateStorageRequest,
  watchStorageAddEditStatus,
};
