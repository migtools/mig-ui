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

  return dispatch => {
    return axios.get(oauthMetaUrl)
      .then(res => dispatch(setOauthMeta(res.data)))
      .catch(err => {
        dispatch(loginFailure());
        dispatch(alertError(err));
      });
  };
};

const fetchToken = (oauthClient, codeRedirect) => {
  return dispatch => {
    oauthClient.code.getToken(codeRedirect).then(result => {
      const user = result.data;
      localStorage.setItem(LS_KEY_CURRENT_USER, JSON.stringify(user));
      dispatch(loginSuccess(user));
      dispatch(push('/'));
    }).catch(err => {
      // TODO: Need to handle a failed login
      dispatch(loginFailure());
      dispatch(alertError(err));
    });
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
