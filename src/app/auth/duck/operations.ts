import axios from 'axios';
import { Creators } from './actions';
import { Creators as AlertCreators } from '../../common/duck/actions';
import { push } from 'connected-react-router';

const loginSuccess = Creators.loginSuccess;
const loginFailure = Creators.loginFailure;
const setOauthMeta = Creators.setOauthMeta;
const alertSuccess = AlertCreators.alertSuccess;
const alertError = AlertCreators.alertError;

const LS_KEY_CURRENT_USER = 'currentUser';

const fetchOauthMeta = clusterApi => {
  const oauthMetaUrl = `${clusterApi}/.well-known/oauth-authorization-server`;

  return async dispatch => {
    try {
      const res = await axios.get(oauthMetaUrl);
      dispatch(setOauthMeta(res.data));
    } catch (err) {
      dispatch(loginFailure());
      dispatch(alertError(err));
    }
  };
};

const fetchToken = (oauthClient, codeRedirect) => {
  return async dispatch => {
    try {
      const result = await oauthClient.code.getToken(codeRedirect);
      const user = result.data;
      localStorage.setItem(LS_KEY_CURRENT_USER, JSON.stringify(user));
      dispatch(loginSuccess(user));
      dispatch(push('/'));
    } catch (err) {
      dispatch(loginFailure());
      dispatch(alertError(err));
    }
  };
};

const initFromStorage = () => {
  return dispatch => {
    const currentUser = localStorage.getItem(LS_KEY_CURRENT_USER);
    if (!!currentUser) {
      dispatch(loginSuccess(JSON.parse(currentUser)));
    }
  };
};

export default {
  fetchOauthMeta,
  fetchToken,
  initFromStorage,
};
