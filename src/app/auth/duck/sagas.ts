import axios from 'axios';
<<<<<<< HEAD
import { takeLatest, put } from 'redux-saga/effects';
import { AuthActions, AuthActionTypes } from './actions';
import {
  AlertActions
=======
import { select, takeLatest, race, call, delay, take, put } from 'redux-saga/effects';
import { AuthActions, AuthActionTypes } from './actions';
import {
    AlertActions
>>>>>>> wip
} from '../../common/duck/actions';

import { push } from 'connected-react-router';
import moment from 'moment';

import { isSelfSignedCertError, handleSelfSignedCertError } from '../../common/duck/utils';

const LS_KEY_CURRENT_USER = 'currentUser';

<<<<<<< HEAD
export function* fetchOauthMeta(action) {
  const oauthMetaUrl = `${action.clusterApi}/.well-known/oauth-authorization-server`;
  try {
    const res = yield axios.get(oauthMetaUrl);
    yield put(AuthActions.setOauthMeta(res.data));
  }
  catch (err) {
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
=======
const fetchOauthMeta = clusterApi => {
    const oauthMetaUrl = `${clusterApi}/.well-known/oauth-authorization-server`;

    return async dispatch => {
        try {
            const res = await axios.get(oauthMetaUrl);
            dispatch(AuthActions.setOauthMeta(res.data));
        } catch (err) {
            if (isSelfSignedCertError(err)) {
                handleSelfSignedCertError(oauthMetaUrl, dispatch);
                return;
            }
            dispatch(AuthActions.loginFailure());
            dispatch(AlertActions.alertErrorTimeout(err));
        }
    };
};

const fetchToken = (oauthClient, codeRedirect) => {
    return async dispatch => {
        try {
            const result = await oauthClient.code.getToken(codeRedirect);
            const user = result.data;
            const currentUnixTime = moment().unix();
            const expiryUnixTime = currentUnixTime + user.expires_in;
            user.login_time = currentUnixTime;
            user.expiry_time = expiryUnixTime;
            localStorage.setItem(LS_KEY_CURRENT_USER, JSON.stringify(user));
            dispatch(AuthActions.loginSuccess(user));
            dispatch(push('/'));
        } catch (err) {
            dispatch(AuthActions.loginFailure());
            dispatch(AlertActions.alertErrorTimeout(err));
        }
    };
};

// const initFromStorage = () => {
//     return dispatch => {
//         const currentUser = localStorage.getItem(LS_KEY_CURRENT_USER);
//         if (currentUser) {
//             dispatch(AuthActions.loginSuccess(JSON.parse(currentUser)));
//         }
//     };
// };

export function* initFromStorage() {
    try {
        const currentUser = localStorage.getItem(LS_KEY_CURRENT_USER);
        if (currentUser) {
            yield put(AuthActions.loginSuccess(JSON.parse(currentUser)));
        }
    } catch (error) {
        throw error;
    }
>>>>>>> wip
}


export function* logoutUser() {
<<<<<<< HEAD
  localStorage.removeItem(LS_KEY_CURRENT_USER);
  yield put(push('/login?action=refresh'));
=======
    try {
        localStorage.removeItem(LS_KEY_CURRENT_USER);
        yield put(push('/login?action=refresh'));
    } catch (error) {
        throw error;
    }
>>>>>>> wip
}


function* watchAuthEvents() {
<<<<<<< HEAD
  yield takeLatest(AuthActionTypes.LOGOUT_USER_REQUEST, logoutUser);
  yield takeLatest(AuthActionTypes.INIT_FROM_STORAGE, initFromStorage);
  yield takeLatest(AuthActionTypes.FETCH_TOKEN, fetchToken);
  yield takeLatest(AuthActionTypes.FETCH_OAUTH_META, fetchOauthMeta);
}

export default {
  watchAuthEvents
=======
    yield takeLatest(AuthActionTypes.LOGOUT_USER_REQUEST, logoutUser);
    yield takeLatest(AuthActionTypes.INIT_FROM_STORAGE, initFromStorage);
    // yield takeLatest(AlertActionTypes.ALERT_SUCCESS_TIMEOUT, successTimeoutSaga);
}

export default {
    watchAuthEvents
    //   fetchOauthMeta,
    //   fetchToken,
    //   initFromStorage,
    //   logoutUser,
>>>>>>> wip
};
