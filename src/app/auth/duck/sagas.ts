import axios from 'axios';
import { select, takeLatest, race, call, delay, take, put } from 'redux-saga/effects';
import { AuthActions, AuthActionTypes } from './actions';
import { PlanActionTypes } from '../../..../../plan/duck/actions';
import { AlertActions } from '../../common/duck/actions';

import { push } from 'connected-react-router';
import moment from 'moment';

import { isSelfSignedCertError, handleSelfSignedCertError } from '../../common/duck/utils';
import { getActiveNamespaceFromStorage } from '../../common/helpers';
import { NON_ADMIN_ENABLED } from '../../../TEMPORARY_GLOBAL_FLAGS';

const LS_KEY_CURRENT_USER = 'currentUser';

export function* fetchOauthMeta(action) {
  const oauthMetaUrl = `${action.clusterApi}/.well-known/oauth-authorization-server`;
  try {
    const res = yield axios.get(oauthMetaUrl);
    yield put(AuthActions.setOauthMeta(res.data));
  } catch (err) {
    if (isSelfSignedCertError(err)) {
      yield put(AuthActions.certErrorOccurred(oauthMetaUrl));
      yield put(push('/cert-error'));
      return;
    }
    yield put(AuthActions.loginFailure());
    yield put(AlertActions.alertErrorTimeout(err));
  }
}

export function* fetchToken(action) {
  const { oauthClient, coreRedirect } = action;
  const result = yield oauthClient.code.getToken(coreRedirect);
  const user = result.data;
  const currentUnixTime = moment().unix();
  const expiryUnixTime = currentUnixTime + user.expires_in;
  user.login_time = currentUnixTime;
  user.expiry_time = expiryUnixTime;
  localStorage.setItem(LS_KEY_CURRENT_USER, JSON.stringify(user));
  yield put(AuthActions.loginSuccess(user));
  yield put(push('/'));
}

export function* initFromStorage(): any {
  const currentUser = localStorage.getItem(LS_KEY_CURRENT_USER);
  if (currentUser) {
    yield put(AuthActions.loginSuccess(JSON.parse(currentUser)));
  }
}

export function* fetchTenantNamespaces(): any {
  const state = yield select();
  const { migMeta } = state.auth;
  try {
    const { access_token } = state.auth.user;
    const tenantNamespacesUrl = `${migMeta.discoveryApi}/namespaces/`;

    const config = {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    };
    const tenantNamespacesRes = yield axios.get(tenantNamespacesUrl, config);

    const namespaceResourceList = tenantNamespacesRes.data.resources;
    yield put(AuthActions.fetchTenantNamespacesSuccess(namespaceResourceList));
  } catch (err) {
    console.error('Failed to fetch tenant namespaces.');
  }
}

export function* logoutUser() {
  localStorage.removeItem(LS_KEY_CURRENT_USER);
  yield put(push('/login?action=refresh'));
}

export function* checkHasLoggedIn() {
  const LS_KEY_HAS_LOGGED_IN = 'hasLoggedIn';

  const hasLoggedIn = JSON.parse(localStorage.getItem(LS_KEY_HAS_LOGGED_IN));
  if (hasLoggedIn) {
    yield put(AuthActions.setWelcomeScreenBool(hasLoggedIn.isHideWelcomeScreen));
    const activeNamespace = getActiveNamespaceFromStorage();
    if (activeNamespace) {
      yield put(AuthActions.setActiveNamespace(activeNamespace));
    }
  } else {
    const loginInfoObject = { isHideWelcomeScreen: false };
    localStorage.setItem(LS_KEY_HAS_LOGGED_IN, JSON.stringify(loginInfoObject));
    yield put(AuthActions.setWelcomeScreenBool(false));
  }
}

export function* fetchIsAdmin(): any {
  const state = yield select();
  const { migMeta } = state.auth;
  if (state.auth.user) {
    const { access_token } = state.auth.user;
    const isAdminUrl = `${migMeta.discoveryApi}/namespaces/openshift-migration/auth`;
    const config = {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    };

    let isAdminRes;
    try {
      isAdminRes = yield axios.get(isAdminUrl, config);
    } catch (err) {
      if (isSelfSignedCertError(err)) {
        yield put(AuthActions.certErrorOccurred(isAdminUrl));
        yield put(push('/cert-error'));
        return;
      }
    }
    if (isAdminRes.data) {
      yield put(AuthActions.setIsAdmin(isAdminRes.data.hasAdmin));
    } else {
      console.error('No data in admin auth response.');
    }
  } else {
    console.error('Attempted to fetch "isAdmin" without a logged in user!');
  }
}

export function* loginSuccess() {
  if (NON_ADMIN_ENABLED) {
    yield put(AuthActions.checkHasLoggedIn());
    yield put(AuthActions.fetchIsAdmin());
  }
}

function* watchAuthEvents() {
  yield takeLatest(AuthActionTypes.LOGOUT_USER_REQUEST, logoutUser);
  yield takeLatest(AuthActionTypes.INIT_FROM_STORAGE, initFromStorage);
  yield takeLatest(AuthActionTypes.FETCH_TOKEN, fetchToken);
  yield takeLatest(AuthActionTypes.FETCH_OAUTH_META, fetchOauthMeta);
  yield takeLatest(AuthActionTypes.LOGIN_SUCCESS, loginSuccess);
  if (NON_ADMIN_ENABLED) {
    yield takeLatest(AuthActionTypes.CHECK_HAS_LOGGED_IN, checkHasLoggedIn);
    yield takeLatest(AuthActionTypes.FETCH_IS_ADMIN, fetchIsAdmin);
  }
  yield takeLatest(AuthActionTypes.FETCH_TENANT_NAMESPACES, fetchTenantNamespaces);
}

export default {
  watchAuthEvents,
};
