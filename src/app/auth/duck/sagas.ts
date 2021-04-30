import { select, takeLatest, race, call, delay, take, put } from 'redux-saga/effects';

import { push } from 'connected-react-router';
import { initFromStorage, loginSuccess, logoutUserRequest, storeLoginToken } from './slice';

const LS_KEY_CURRENT_USER = 'currentUser';

export function* storeLoginTokenFunc(action) {
  const { user } = action;
  localStorage.setItem(LS_KEY_CURRENT_USER, JSON.stringify(user));
  yield put(loginSuccess(user));
  yield put(push('/'));
}

export function* initFromStorageFunc(): any {
  const currentUser = localStorage.getItem(LS_KEY_CURRENT_USER);
  if (currentUser) {
    yield put(loginSuccess(JSON.parse(currentUser)));
  }
}

export function* logoutUser() {
  localStorage.removeItem(LS_KEY_CURRENT_USER);
  yield put(push('/login?action=refresh'));
}

function* watchAuthEvents() {
  yield takeLatest(logoutUserRequest, logoutUser);
  yield takeLatest(initFromStorage, initFromStorageFunc);
  yield takeLatest(storeLoginToken, storeLoginTokenFunc);
}

export default {
  watchAuthEvents,
};
