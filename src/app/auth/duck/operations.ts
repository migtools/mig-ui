//import fetch from 'cross-fetch';
import axios from 'axios';
import { Creators } from './actions';
import { Creators as AlertCreators } from '../../common/duck/actions';
import { push } from 'connected-react-router';

const loginSuccess = Creators.loginSuccess;
const loginFailure = Creators.loginFailure;
const setOauthMeta = Creators.setOauthMeta;
const alertSuccess = AlertCreators.alertSuccess;
const alertError = AlertCreators.alertError;

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

export default {
  fetchOauthMeta,
};
