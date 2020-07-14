import { ILoginParams, IMigMeta } from './types';
import { IAuthReducerState } from './reducers';

export const AuthActionTypes = {
  STORE_LOGIN_TOKEN: 'STORE_LOGIN_TOKEN',
  FETCH_TENANT_NAMESPACES: 'FETCH_TENANT_NAMESPACES',
  FETCH_TENANT_NAMESPACES_SUCCESS: 'FETCH_TENANT_NAMESPACES_SUCCESS',
  LOGOUT_USER_REQUEST: 'LOGOUT_USER_REQUEST',
  INIT_FROM_STORAGE: 'INIT_FROM_STORAGE',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  SET_IS_ADMIN: 'SET_IS_ADMIN',
  FETCH_IS_ADMIN: 'FETCH_IS_ADMIN',
  CERT_ERROR_OCCURRED: 'CERT_ERROR_OCCURRED',
  SET_WELCOME_SCREEN_BOOL: 'SET_WELCOME_SCREEN_BOOL',
  CHECK_ACTIVE_NAMESPACE: 'CHECK_ACTIVE_NAMESPACE',
  CHECK_HAS_LOGGED_IN: 'CHECK_HAS_LOGGED_IN',
  INIT_MIG_META: 'INIT_MIG_META',
  SET_ACTIVE_NAMESPACE: 'SET_ACTIVE_NAMESPACE',
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

const fetchIsAdmin = () => ({
  type: AuthActionTypes.FETCH_IS_ADMIN,
});

const fetchTenantNamespaces = () => ({
  type: AuthActionTypes.FETCH_TENANT_NAMESPACES,
});

const fetchTenantNamespacesSuccess = (
  tenantNamespaceList: IAuthReducerState['tenantNamespaceList']
) => ({
  type: AuthActionTypes.FETCH_TENANT_NAMESPACES_SUCCESS,
  tenantNamespaceList,
});

const initFromStorage = () => ({
  type: AuthActionTypes.INIT_FROM_STORAGE,
});

const certErrorOccurred = (failedUrl: string) => ({
  type: AuthActionTypes.CERT_ERROR_OCCURRED,
  failedUrl,
});

const storeLoginToken = (user: any) => ({
  type: AuthActionTypes.STORE_LOGIN_TOKEN,
  user,
});

const setIsAdmin = (hasAdmin: boolean) => ({
  type: AuthActionTypes.SET_IS_ADMIN,
  hasAdmin,
});

const setWelcomeScreenBool = (isHideWelcomeScreen: boolean) => ({
  type: AuthActionTypes.SET_WELCOME_SCREEN_BOOL,
  isHideWelcomeScreen,
});

const checkHasLoggedIn = () => ({
  type: AuthActionTypes.CHECK_HAS_LOGGED_IN,
});

const initMigMeta = (migMeta: IMigMeta) => {
  return {
    type: AuthActionTypes.INIT_MIG_META,
    migMeta,
  };
};

const setActiveNamespace = (activeNamespace) => {
  return {
    type: AuthActionTypes.SET_ACTIVE_NAMESPACE,
    activeNamespace,
  };
};

export const AuthActions = {
  logoutUserRequest,
  initFromStorage,
  loginSuccess,
  loginFailure,
  storeLoginToken,
  certErrorOccurred,
  setIsAdmin,
  fetchTenantNamespaces,
  fetchTenantNamespacesSuccess,
  fetchIsAdmin,
  setWelcomeScreenBool,
  checkHasLoggedIn,
  initMigMeta,
  setActiveNamespace,
};
