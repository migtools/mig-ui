import fetch from 'cross-fetch';
import { Creators } from './actions';
import { Creators as AlertCreators } from '../../common/duck/actions';
import { JWT_API_URL, SOCKET_API_URL, JSON_SERVER_URL } from '../../../config';
import { push } from 'connected-react-router';

const login = Creators.login;
const logout = Creators.logout;
const loginSuccess = Creators.loginSuccess;
const loginFailure = Creators.loginFailure;
const alertSuccess = AlertCreators.alertSuccess;
const alertError = AlertCreators.alertError;

const loginRequest = (username, password) => {
  return dispatch => {
    dispatch(login(username, password));
    return fetch(JSON_SERVER_URL + 'auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password,
        email: username,
      }),
    })
      .then(handleResponse)
      .then(res => {
        localStorage.setItem('currentUser', JSON.stringify(res.access_token));
        dispatch(loginSuccess(username));
        // dispatch(alertSuccess('You have logged in successfully!'));
        dispatch(push('/'));
      })
      .catch(error => {
        dispatch(loginFailure(error));
        dispatch(alertError(error));
      });
  };
};

function handleResponse(response) {
  return response.text().then(text => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        logoutRequest();
      }

      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}

function logoutRequest() {
  return dispatch => {
    dispatch(logout());
    localStorage.removeItem('currentUser');
    dispatch(push('/login'));
  };
}

const setOAuthTokenRequest = res => {
  return dispatch => {
    localStorage.setItem('currentUser', JSON.stringify(res));
    dispatch(loginSuccess(res.name));
    dispatch(push('/'));
  };
};

export default {
  loginRequest,
  logoutRequest,
  setOAuthTokenRequest,
};
