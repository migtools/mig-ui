// NATODO
import { takeLatest, select, race, take, call, put, delay } from 'redux-saga/effects';
import { ClientFactory } from '../../../client/client_factory';
import { IClusterClient } from '../../../client/client';
import { MigResource, MigResourceKind } from '../../../client/resources';
import { CoreNamespacedResource, CoreNamespacedResourceKind } from '../../../client/resources';
import { IToken, IMigToken, ITokenFormValues, TokenType } from './types';
import { TokenActionTypes, TokenActions } from './actions';
import {
  createMigTokenSecret,
  createMigToken,
  getTokenSecretLabelSelector,
} from '../../../client/resources/conversions';
import { AlertActions } from '../../common/duck/actions';

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
  const state = yield select();
  const client: IClusterClient = ClientFactory.cluster(state);
  const resource = new MigResource(MigResourceKind.MigToken, state.auth.migMeta.namespace);
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
  const state = yield select();
  const { migMeta } = state.auth;
  const tokenValues: ITokenFormValues = action.tokenValues;
  const client: IClusterClient = ClientFactory.cluster(state);

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
      throw new Error(`MigToken "${tokenValues.name} already exists`);
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
    return;
  }

  yield put(
    TokenActions.addTokenSuccess({
      MigToken: migTokenResult.data,
      Secret: migTokenSecretResult.data,
    })
  );
}

function* removeTokenSaga(action) {
  try {
    const state = yield select();
    const { migMeta } = state.auth;
    const { name } = action;
    const client: IClusterClient = ClientFactory.cluster(state);

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

function* watchAddTokenRequest() {
  yield takeLatest(TokenActionTypes.ADD_TOKEN_REQUEST, addTokenRequest);
}

function* watchRemoveTokenRequest() {
  yield takeLatest(TokenActionTypes.REMOVE_TOKEN_REQUEST, removeTokenSaga);
}

export default {
  // NATODO: Implement and/or remove unecessary copies
  watchRemoveTokenRequest,
  watchAddTokenRequest,
  // watchUpdateClusterRequest,
  // watchClusterAddEditStatus,
  fetchTokensGenerator,
};
