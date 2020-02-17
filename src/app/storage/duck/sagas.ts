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
import Q from 'q';

function* addStorageRequest(action) {
  const state = yield select();
  const { migMeta } = state;
  const { storageValues } = action;
  const client: IClusterClient = ClientFactory.cluster(state);

  const storageSecret = createStorageSecret(
    storageValues.name,
    migMeta.configNamespace,
    storageValues.bslProvider,
    storageValues.secret,
    storageValues.accessKey,
    storageValues.gcpBlob,
    storageValues.azureBlob,
  );

  const migStorage = createMigStorage(
    storageValues.name,
    storageValues.bslProvider,
    migMeta.namespace,
    storageSecret,
    storageValues.requireSSL,
    storageValues.caBundle,
    storageValues.awsBucketName,
    storageValues.awsBucketRegion,
    storageValues.s3Url,
    storageValues.gcpBucket,
    storageValues.azureResourceGroup,
    storageValues.azureStorageAccount,
  );

  const secretResource = new CoreNamespacedResource(
    CoreNamespacedResourceKind.Secret,
    migMeta.configNamespace
  );
  const migStorageResource = new MigResource(
    MigResourceKind.MigStorage, migMeta.namespace);

  // Ensure that none of the objects that make up storage already exist
  try {
    const getResults = yield Q.allSettled([
      client.get(migStorageResource, migStorage.metadata.name),
      client.get(secretResource, storageSecret.metadata.name),
    ]);

    const alreadyExists = getResults.reduce((exists, res) => {
      return res.value && res.value.status === 200 ?
        [...exists, { kind: res.value.data.kind, name: res.value.data.metadata.name }] :
        exists;
    }, []);

    if (alreadyExists.length > 0) {
      throw new Error(alreadyExists.reduce((msg, v) => {
        return msg + `- kind: "${v.kind}", name: "${v.name}"`;
      }, 'Some storage objects already exist '));
    }
  } catch (err) {
    console.error(err.message);
    yield put(StorageActions.setStorageAddEditStatus(createAddEditStatusWithMeta(
      AddEditState.Critical,
      AddEditMode.Add,
      err.message,
      '',
    )));
    return;
  }

  // None of the objects already exist, so try to create all of the objects
  // If any of the objects actually fail creation, we need to rollback the others
  // so the storage is created, or fails atomically
  try {
    const storageAddResults = yield Q.allSettled([
      client.create(secretResource, storageSecret),
      client.create(migStorageResource, migStorage),
    ]);

    // If any of the attempted object creation promises have failed, we need to
    // rollback those that succeeded so we don't have a halfway created "Storage"
    // A rollback is only required if some objects have actually *succeeded*,
    // as well as failed.
    const isRollbackRequired =
      storageAddResults.find(res => res.state === 'rejected') &&
      storageAddResults.find(res => res.state === 'fulfilled');

    if (isRollbackRequired) {
      const kindToResourceMap = {
        MigStorage: migStorageResource,
        Secret: secretResource,
      };

      // The objects that need to be rolled back are those that were fulfilled
      const rollbackObjs = storageAddResults.reduce((rollbackAccum, res) => {
        return res.state === 'fulfilled' ?
          [...rollbackAccum, { kind: res.value.data.kind, name: res.value.data.metadata.name }] :
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
        throw Error(storageAddResults.find(res => res.state === 'rejected').reason);
      }
    } // End rollback handling

    const storage = storageAddResults.reduce((accum, res) => {
      const data = res.value.data;
      accum[data.kind] = data;
      return accum;
    }, {});

    yield put(StorageActions.addStorageSuccess(storage));

    // Push into watching state
    yield put(StorageActions.setStorageAddEditStatus(
      createAddEditStatus(AddEditState.Watching, AddEditMode.Edit),
    ));
    yield put(StorageActions.watchStorageAddEditStatus(storageValues.name));
  } catch (err) {
    console.error('Storage failed creation with error: ', err);
    put(AlertActions.alertErrorTimeout('Storage failed creation'));
    return;
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
  const client: IClusterClient = ClientFactory.cluster(state);

  const currentStorage = state.storage.migStorageList.find(c => {
    return c.MigStorage.metadata.name === storageValues.name;
  });

  // Check to see if any fields on the MigStorage were updated
  //AWS
  const currentBucketName =
    currentStorage.MigStorage.spec.backupStorageConfig.awsBucketName;

  const bucketNameUpdated = storageValues.awsBucketName !== currentBucketName;

  const currentRegion =
    currentStorage.MigStorage.spec.backupStorageConfig.awsRegion;

  const regionUpdated = storageValues.awsBucketRegion !== currentRegion;

  const currentS3Url =
    currentStorage.MigStorage.spec.backupStorageConfig.awsS3Url;

  const s3UrlUpdated = storageValues.s3Url !== currentS3Url;

  const currentRequireSSL = !currentStorage.MigStorage.spec.backupStorageConfig.insecure;
  const requireSSLUpdated = storageValues.requireSSL !== currentRequireSSL;

  const currentCABundle = currentStorage.MigStorage.spec.backupStorageConfig.s3CustomCABundle;
  const caBundleUpdated = storageValues.caBundle !== currentCABundle;
  //
  //GCP
  const currentGCPBucketName =
    currentStorage.MigStorage.spec.backupStorageConfig.gcpBucket;

  const gcpBucketNameUpdated = storageValues.gcpBucket !== currentGCPBucketName;
  //
  //Azure
  const currentAzureResourceGroup =
    currentStorage.MigStorage.spec.backupStorageConfig.azureResourceGroup;

  const azureResourceGroupUpdated = storageValues.azureResourceGroup !== currentAzureResourceGroup;

  const currentAzureStorageAccount =
    currentStorage.MigStorage.spec.backupStorageConfig.azureStorageAccount;

  const azureStorageAccountUpdated = storageValues.azureStorageAccount !== currentAzureStorageAccount;
  //

  const migStorageUpdated =
    //AWS
    bucketNameUpdated ||
    regionUpdated ||
    s3UrlUpdated ||
    requireSSLUpdated ||
    caBundleUpdated ||
    //GCP
    gcpBucketNameUpdated ||
    //Azure
    azureResourceGroupUpdated ||
    azureStorageAccountUpdated;


  // Check to see if any fields on the kube secret were updated
  // NOTE: Need to decode the b64 token off a k8s secret
  //AW S
  let currentAccessKey;
  if (currentStorage.Secret.data[accessKeyIdSecretField]) {
    currentAccessKey = atob(currentStorage.Secret.data[accessKeyIdSecretField]);
  }
  const accessKeyUpdated = storageValues.accessKey !== currentAccessKey;

  let currentSecret;
  if (currentStorage.Secret.data[secretAccessKeySecretField]) {
    currentSecret = atob(currentStorage.Secret.data[secretAccessKeySecretField]);
  }

  const secretUpdated = storageValues.secret !== currentSecret;
  //
  //GCP
  let currentGCPBlob;
  if (currentStorage.Secret.data['gcp-credentials']) {
    currentGCPBlob = atob(currentStorage.Secret.data['gcp-credentials']);
  }

  const gcpBlobUpdated = storageValues.gcpBlob !== currentGCPBlob;
  //
  // AZURE
  let currentAzureBlob;
  if (currentStorage.Secret.data['azure-credentials']) {
    currentAzureBlob = atob(currentStorage.Secret.data['azure-credentials']);
  }
  const azureBlobUpdated = storageValues.azureBlob !== currentAzureBlob;
  //

  const kubeSecretUpdated = accessKeyUpdated || secretUpdated || gcpBlobUpdated || azureBlobUpdated;

  if (!migStorageUpdated && !kubeSecretUpdated) {
    console.warn('A storage update was requested, but nothing was changed');
    return;
  }

  const updatePromises = [];
  if (migStorageUpdated) {
    const updatedMigStorage = updateMigStorage(
      storageValues.bslProvider,
      storageValues.awsBucketName,
      storageValues.awsBucketRegion,
      storageValues.s3Url,
      storageValues.gcpBucket,
      storageValues.azureResourceGroup,
      storageValues.azureStorageAccount,
      storageValues.requireSSL,
      storageValues.caBundle,
    );
    const migStorageResource = new MigResource(
      MigResourceKind.MigStorage, migMeta.namespace);

    // Pushing a request fn to delay the call until its yielded in a batch at same time
    updatePromises.push(() => client.patch(
      migStorageResource, storageValues.name, updatedMigStorage));
  }

  if (kubeSecretUpdated) {
    const updatedSecret = updateStorageSecret(
      storageValues.bslProvider,
      storageValues.secret,
      storageValues.accessKey,
      storageValues.gcpBlob,
      storageValues.azureBlob,
    );
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

      const client: IClusterClient = ClientFactory.cluster(state);
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
