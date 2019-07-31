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
  type: Types.LOGIN_SUCCESS,
  user,
});

const loginFailure = () =>
({
  type: Types.LOGIN_FAILURE,
});

const setOauthMeta = (oauthMeta: string) =>
({
  type: Types.SET_OAUTH_META,
  oauthMeta,
});


export const Types = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  SET_OAUTH_META: 'SET_OAUTH_META',
};

export const Creators = {
  loginSuccess,
  loginFailure,
  setOauthMeta,
};
