import { AuthActionTypes } from './actions';
import { IMigMeta, ILoginParams } from './types';
import { NON_ADMIN_ENABLED } from '../../../TEMPORARY_GLOBAL_FLAGS';

const LS_KEY_HAS_LOGGED_IN = 'hasLoggedIn';
const hasLoggedIn = JSON.parse(localStorage.getItem(LS_KEY_HAS_LOGGED_IN));

export interface IAuthReducerState {
  user: ILoginParams;
  oauthMeta: string;
  certError: {
    failedUrl: string;
  };
  isAdmin: boolean;
  isHideWelcomeScreen: boolean;
  tenantNamespaceList: {
    name: string;
  }[];
  migMeta: IMigMeta;
}

type AuthReducerFn = (state: IAuthReducerState, action: any) => IAuthReducerState;

const INITIAL_STATE: IAuthReducerState = {
  user: null,
  oauthMeta: null,
  certError: null,
  isAdmin: NON_ADMIN_ENABLED ? null : true,
  isHideWelcomeScreen: hasLoggedIn ? hasLoggedIn.isHideWelcomeScreen : true,
  tenantNamespaceList: [],
  migMeta: {},
};

export const authReducer: AuthReducerFn = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_SUCCESS:
      return { ...state, user: action.user };
    case AuthActionTypes.LOGIN_FAILURE:
      return { ...state, user: null };
    case AuthActionTypes.SET_OAUTH_META:
      return { ...state, oauthMeta: action.oauthMeta };
    case AuthActionTypes.SET_IS_ADMIN:
      return NON_ADMIN_ENABLED ? { ...state, isAdmin: action.hasAdmin } : state;
    case AuthActionTypes.CERT_ERROR_OCCURRED:
      return { ...state, certError: { failedUrl: action.failedUrl } };
    case AuthActionTypes.SET_WELCOME_SCREEN_BOOL:
      return { ...state, isHideWelcomeScreen: action.isHideWelcomeScreen };
    case AuthActionTypes.FETCH_TENANT_NAMESPACES_SUCCESS:
      return { ...state, tenantNamespaceList: action.tenantNamespaceList };
    case AuthActionTypes.INIT_MIG_META:
      return { ...state, migMeta: action.migMeta };
    case AuthActionTypes.SET_ACTIVE_NAMESPACE:
      return {
        ...state,
        migMeta: { ...state.migMeta, namespace: action.activeNamespace },
      };
    default:
      return state;
  }
};

export default authReducer;
