import { ILoginParams, IMigMeta } from './types';

export const AuthActionTypes = {
  STORE_LOGIN_TOKEN: 'STORE_LOGIN_TOKEN',
  LOGOUT_USER_REQUEST: 'LOGOUT_USER_REQUEST',
  INIT_FROM_STORAGE: 'INIT_FROM_STORAGE',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  CERT_ERROR_OCCURRED: 'CERT_ERROR_OCCURRED',
  AUTH_ERROR_OCCURRED: 'AUTH_ERROR_OCCURRED',
  INIT_MIG_META: 'INIT_MIG_META',
};

const loginSuccess = (user: ILoginParams) => ({
  type: AuthActionTypes.LOGIN_SUCCESS,
  user,
});

const loginFailure = () => ({
  type: AuthActionTypes.LOGIN_FAILURE,
});

const logoutUserRequest = () => ({
  type: AuthActionTypes.LOGOUT_USER_REQUEST,
});

const initFromStorage = () => ({
  type: AuthActionTypes.INIT_FROM_STORAGE,
});

const certErrorOccurred = (failedUrl: string) => ({
  type: AuthActionTypes.CERT_ERROR_OCCURRED,
  failedUrl,
});

const authErrorOccurred = (authError: string) => ({
  type: AuthActionTypes.AUTH_ERROR_OCCURRED,
  authError,
});

const storeLoginToken = (user: any) => ({
  type: AuthActionTypes.STORE_LOGIN_TOKEN,
  user,
});

const initMigMeta = (migMeta: IMigMeta) => {
  return {
    type: AuthActionTypes.INIT_MIG_META,
    migMeta,
  };
};

export const AuthActions = {
  logoutUserRequest,
  initFromStorage,
  loginSuccess,
  loginFailure,
  storeLoginToken,
  authErrorOccurred,
  certErrorOccurred,
  initMigMeta,
};
