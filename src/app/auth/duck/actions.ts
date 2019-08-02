interface ILoginParams {
  token?: string;
  username?: string;
  access_token?: string;
  expires_in?: number;
  expiry_time?: number;
  login_time?: number;
  scope?: string;
  token_type?: string;
}

const loginSuccess = (user: ILoginParams) =>
({
  type: AuthActionTypes.LOGIN_SUCCESS,
  user,
});

const loginFailure = () =>
({
  type: AuthActionTypes.LOGIN_FAILURE,
});

const setOauthMeta = (oauthMeta: string) =>
({
  type: AuthActionTypes.SET_OAUTH_META,
  oauthMeta,
});

const certErrorOccurred = (failedUrl: string) =>
({
  type: AuthActionTypes.CERT_ERROR_OCCURRED,
  failedUrl,
});

export const AuthActionTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  SET_OAUTH_META: 'SET_OAUTH_META',
  CERT_ERROR_OCCURRED: 'CERT_ERROR_OCCURRED',
};

export const AuthActions = {
  loginSuccess,
  loginFailure,
  setOauthMeta,
  certErrorOccurred,
};
