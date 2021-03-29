import { select, takeLatest, race, call, delay, take, put } from 'redux-saga/effects';
import { AuthActions, AuthActionTypes } from './actions';

import { push } from 'connected-react-router';

const LS_KEY_CURRENT_USER = 'currentUser';

export function* storeLoginToken(action) {
  const { user } = action;
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

export function* logoutUser() {
  localStorage.removeItem(LS_KEY_CURRENT_USER);
  yield put(push('/login?action=refresh'));
}

function* watchAuthEvents() {
  yield takeLatest(AuthActionTypes.LOGOUT_USER_REQUEST, logoutUser);
  yield takeLatest(AuthActionTypes.INIT_FROM_STORAGE, initFromStorage);
  yield takeLatest(AuthActionTypes.STORE_LOGIN_TOKEN, storeLoginToken);
}

export default {
  watchAuthEvents,
};
