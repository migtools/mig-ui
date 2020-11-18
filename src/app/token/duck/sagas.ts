// NATODO
import { takeLatest, select, race, take, call, put, delay } from 'redux-saga/effects';
import { IToken, IMigToken, ITokenFormValues, TokenType } from './types';
import { TokenActionTypes, TokenActions } from './actions';
import {
  createMigTokenSecret,
  createMigToken,
  getTokenSecretLabelSelector,
  updateTokenSecret,
} from '../../../client/resources/conversions';
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
import { AlertActions } from '../../common/duck/actions';
import { IReduxState } from '../../../reducers';
import {
  ClientFactory,
  CoreNamespacedResource,
  CoreNamespacedResourceKind,
  IClusterClient,
} from '@konveyor/lib-ui';
import { MigResource, MigResourceKind } from '../../../client/helpers';

function fetchTokenSecrets(client: IClusterClient, migTokens): Array<Promise<any>> {
  const secretRefs: Array<Promise<any>> = [];

  migTokens.forEach((token) => {
    const secretRef = token.spec.secretRef;
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      secretRef.namespace
    );
    secretRefs.push(client.get(secretResource, secretRef.name));
  });

  return secretRefs;
}

function groupTokens(migTokens: IMigToken[], secretRefs: any[]): IToken[] {
  return migTokens.map((mt) => ({
    MigToken: mt,
    Secret: secretRefs.find(
      (s) => s.kind === 'Secret' && s.metadata.name === mt.spec.secretRef.name
    ),
  }));
}

function* fetchTokensGenerator() {
  const state: IReduxState = yield select();
  const resource = new MigResource(MigResourceKind.MigToken, state.auth.migMeta.namespace);
  const client: IClusterClient = ClientFactory.cluster(
    state.auth.user,
    state.auth.migMeta.clusterApi
  );
  try {
    let tokenList = yield client.list(resource);
    tokenList = yield tokenList.data.items;
    const secretRefPromises = yield Promise.all(fetchTokenSecrets(client, tokenList));
    const secrets = secretRefPromises.map((s) => s.data);
    const groupedTokens = groupTokens(tokenList, secrets);
    return { updatedTokens: groupedTokens };
  } catch (e) {
    throw e;
  }
}

function* addTokenRequest(action) {
  const state: IReduxState = yield select();
  const { migMeta } = state.auth;
  const client: IClusterClient = ClientFactory.cluster(
    state.auth.user,
    state.auth.migMeta.clusterApi
  );
  const tokenValues: ITokenFormValues = action.tokenValues;

  let migTokenSecretData: string;
  switch (tokenValues.tokenType) {
    case TokenType.OAuth: {
      // NATODO: Get OAuth token from values and set the migTokenSecretData to that
      // should be coming out of localstorage, but let the event handler in the front-end
      // handle that and set the appropriate form value
      console.error('NOT IMPLEMENTED: Add OAuth TokenType');
      break;
    }
    case TokenType.ServiceAccount: {
      migTokenSecretData = tokenValues.serviceAccountToken;
      break;
    }
    default: {
      // NATODO: Rare edge case with unrecognized token type?
      console.error(`addTokenRequest: Unknown TokenType: [${tokenValues.tokenType}]`);
      break;
    }
  }

  const secretResource = new CoreNamespacedResource(
    CoreNamespacedResourceKind.Secret,
    migMeta.configNamespace
  );
  const migTokenResource = new MigResource(MigResourceKind.MigToken, migMeta.namespace);

  const migTokenSecret = createMigTokenSecret(
    tokenValues.name,
    migMeta.configNamespace,
    migTokenSecretData
  );

  try {
    const migTokenLookup = yield client.get(migTokenResource, tokenValues.name);
    // This should never happen -- we're using generateName which should ensure
    // that the secret's name that's created is unique, but just in case...
    if (migTokenLookup.status === 200) {
      const migTokenError = `MigToken "${tokenValues.name} already exists`;
      yield put(AlertActions.alertErrorTimeout(migTokenError));
    }
  } catch (err) {
    //  If response is anything but a 404 response (the normal path), rethrow
    if (!err.response || err.response.status !== 404) {
      throw err;
    }
    // NATODO: Implement add edit status with token
    // yield put(
    //   TokenActionTypes.setClusterAddEditStatus(
    //     createAddEditStatusWithMeta(AddEditState.Critical, AddEditMode.Add, err.message, '')
    //   )
    // );
  }

  let migTokenSecretResult;
  try {
    migTokenSecretResult = yield client.create(secretResource, migTokenSecret);
  } catch (err) {
    console.error(err.response);
    yield put(TokenActions.addTokenFailure(`Failed to add token: ${err.message}`));
    yield put(
      TokenActions.setTokenAddEditStatus(
        createAddEditStatusWithMeta(AddEditState.Critical, AddEditMode.Add, err.message, '')
      )
    );

    return;
  }

  let migTokenResult;
  try {
    const newMigToken = createMigToken(
      tokenValues.name,
      migMeta.namespace,
      migTokenSecretResult.data.metadata.name,
      migTokenSecretResult.data.metadata.namespace,
      tokenValues.associatedClusterName
    );
    migTokenResult = yield client.create(migTokenResource, newMigToken);
  } catch (err) {
    // Rollback succesfully created secret so we don't leak it if the token itself failed
    console.error(err.response);
    yield client.delete(secretResource, migTokenSecretResult.data.metadata.name);
    yield put(TokenActions.addTokenFailure(`Failed to add token: ${err.message}`));
    yield put(
      TokenActions.setTokenAddEditStatus(
        createAddEditStatusWithMeta(AddEditState.Critical, AddEditMode.Add, err.message, '')
      )
    );
    return;
  }

  yield put(
    AlertActions.alertSuccessTimeout(
      `Successfully added token "${migTokenResult.data.metadata.name}"!`
    )
  );
  const newMigToken = {
    MigToken: migTokenResult.data,
    Secret: migTokenSecretResult.data,
  };

  yield put(TokenActions.addTokenSuccess(newMigToken));
  yield put(TokenActions.setCurrentToken(newMigToken));

  yield put(
    TokenActions.setTokenAddEditStatus(createAddEditStatus(AddEditState.Ready, AddEditMode.Edit))
  );
}

function* removeTokenSaga(action) {
  try {
    const state: IReduxState = yield select();
    const { migMeta } = state.auth;
    const client: IClusterClient = ClientFactory.cluster(
      state.auth.user,
      state.auth.migMeta.clusterApi
    );
    const { name } = action;

    //remove token
    const secretResource = new CoreNamespacedResource(
      CoreNamespacedResourceKind.Secret,
      migMeta.configNamespace
    );
    const migTokenResource = new MigResource(MigResourceKind.MigToken, migMeta.namespace);

    const tokenRes = yield client.get(migTokenResource, name);

    yield Promise.all([
      client.delete(secretResource, tokenRes.data.spec.secretRef.name),
      client.delete(migTokenResource, name),
    ]);

    yield put(TokenActions.removeTokenSuccess(name));
    yield put(AlertActions.alertSuccessTimeout(`Successfully removed token "${name}"!`));
  } catch (err) {
    yield put(AlertActions.alertErrorTimeout(err));
    yield put(TokenActions.removeTokenFailure(err));
  }
}

function* pollTokenAddEditStatus(action) {
  // Give the controller some time to bounce
  yield delay(AddEditDebounceWait);
  while (true) {
    try {
      const state: IReduxState = yield select();
      const { migMeta } = state.auth;
      const client: IClusterClient = ClientFactory.cluster(
        state.auth.user,
        state.auth.migMeta.clusterApi
      );
      const { tokenName } = action;

      const migTokenResource = new MigResource(MigResourceKind.MigToken, migMeta.namespace);
      const tokenPollResult = yield client.get(migTokenResource, tokenName);

      const hasStatusAndConditions = tokenPollResult.data.status?.conditions;

      if (hasStatusAndConditions) {
        const criticalCond = tokenPollResult.data.status.conditions.find((cond) => {
          return cond.category === AddEditConditionCritical;
        });

        if (criticalCond) {
          return createAddEditStatusWithMeta(
            AddEditState.Critical,
            AddEditMode.Edit,
            criticalCond.message,
            criticalCond.reason
          );
        }

        const readyCond = tokenPollResult.data.status.conditions.find((cond) => {
          return cond.type === AddEditConditionReady;
        });

        if (readyCond) {
          return createAddEditStatusWithMeta(
            AddEditState.Ready,
            AddEditMode.Edit,
            readyCond.message,
            '' // Ready has no reason
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

function* startWatchingTokenAddEditStatus(action) {
  // Start a race, poll until the watch is cancelled (by closing the modal),
  // polling times out, or the condition is added, in that order of precedence.
  const raceResult = yield race({
    addEditResult: call(pollTokenAddEditStatus, action),
    timeout: delay(AddEditWatchTimeout),
    cancel: take(TokenActionTypes.CANCEL_WATCH_TOKEN_ADD_EDIT_STATUS),
  });

  if (raceResult.cancel) {
    return;
  }

  const addEditResult: IAddEditStatus = raceResult.addEditResult;

  const statusToDispatch =
    addEditResult || createAddEditStatus(AddEditState.TimedOut, AddEditMode.Edit);

  yield put(TokenActions.setTokenAddEditStatus(statusToDispatch));
}

function* updateTokenRequest(action) {
  // TODO: Probably need rollback logic here too if any fail
  const state: IReduxState = yield select();
  const { migMeta } = state.auth;
  const client: IClusterClient = ClientFactory.cluster(
    state.auth.user,
    state.auth.migMeta.clusterApi
  );
  const { tokenValues } = action;

  const migTokenResource = new MigResource(MigResourceKind.MigToken, migMeta.namespace);
  const getTokenRes = yield client.get(migTokenResource, tokenValues.name);
  const secretResource = new CoreNamespacedResource(
    CoreNamespacedResourceKind.Secret,
    migMeta.configNamespace
  );
  const updatedMigTokenSecretResult = yield client.get(
    secretResource,
    getTokenRes.data.spec.secretRef.name
  );
  const currentToken = {
    MigToken: getTokenRes.data,
    Secret: updatedMigTokenSecretResult.data,
  };

  try {
    if (tokenValues.tokenType === TokenType.ServiceAccount) {
      const rawCurrentToken = atob(currentToken.Secret.data.token);

      const tokenUpdated = tokenValues.serviceAccountToken !== rawCurrentToken;

      if (!tokenUpdated) {
        console.warn('A token update was requested, but nothing was changed');
        return;
      }
      if (tokenUpdated) {
        const newTokenSecret = updateTokenSecret(tokenValues.serviceAccountToken, true);
        const secretResource = new CoreNamespacedResource(
          CoreNamespacedResourceKind.Secret,
          migMeta.configNamespace
        );

        const patchRes = yield client.patch(
          secretResource,
          currentToken.MigToken.spec.secretRef.name,
          newTokenSecret
        );
        const migTokenResource = new MigResource(MigResourceKind.MigToken, migMeta.namespace);
        const updatedTokenRes = yield client.get(migTokenResource, tokenValues.name);
        const updatedMigTokenSecretResult = yield client.get(
          secretResource,
          updatedTokenRes.data.spec.secretRef.name
        );
        yield put(TokenActions.updateTokenSuccess(updatedTokenRes.data));
        const updatedMigToken = {
          MigToken: updatedTokenRes.data,
          Secret: updatedMigTokenSecretResult.data,
        };

        yield put(TokenActions.setCurrentToken(updatedMigToken));

        yield put(
          TokenActions.setTokenAddEditStatus(
            createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
          )
        );
        yield put(TokenActions.watchTokenAddEditStatus(tokenValues.name));
      }
    } else {
      yield put(AlertActions.alertWarnTimeout(`NATODO: Implement oauth regeneration "${name}"!`));
    }

    // Update the state tree with the updated cluster, and start to watch
    // again to check for its condition after edits
  } catch (err) {
    yield put(TokenActions.updateTokenFailure(err));
  }
}

function* watchUpdateTokenRequest() {
  yield takeLatest(TokenActionTypes.UPDATE_TOKEN_REQUEST, updateTokenRequest);
}

function* watchAddTokenRequest() {
  yield takeLatest(TokenActionTypes.ADD_TOKEN_REQUEST, addTokenRequest);
}

function* watchTokenAddEditStatus() {
  yield takeLatest(TokenActionTypes.WATCH_TOKEN_ADD_EDIT_STATUS, startWatchingTokenAddEditStatus);
}

function* watchRemoveTokenRequest() {
  yield takeLatest(TokenActionTypes.REMOVE_TOKEN_REQUEST, removeTokenSaga);
}

export default {
  // NATODO: Implement and/or remove unecessary copies
  watchRemoveTokenRequest,
  watchAddTokenRequest,
  watchUpdateTokenRequest,
  watchTokenAddEditStatus,
  fetchTokensGenerator,
};
