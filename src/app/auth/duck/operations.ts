import axios from 'axios';
import { AuthActions } from './actions';
import {
  AlertActions
} from '../../common/duck/actions';

import { push } from 'connected-react-router';
import commonSagas from '../../common/duck/sagas';
import moment from 'moment';

import { isSelfSignedCertError, handleSelfSignedCertError } from '../../common/duck/utils';

const LS_KEY_CURRENT_USER = 'currentUser';

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

const initFromStorage = () => {
  return dispatch => {
    const currentUser = localStorage.getItem(LS_KEY_CURRENT_USER);
    if (!!currentUser) {
      dispatch(AuthActions.loginSuccess(JSON.parse(currentUser)));
    }
  };
};

const logoutUser = () => {
  return dispatch => {
    localStorage.removeItem(LS_KEY_CURRENT_USER);
    dispatch(push('/login?action=refresh'));
  };
};

export default {
  fetchOauthMeta,
  fetchToken,
  initFromStorage,
  logoutUser,
};
