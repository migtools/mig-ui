import { AuthActionTypes } from './actions';

const INITIAL_STATE = {
  user: null,
  oauthMeta: null,
  certError: null,
  isAdmin: null,
  isShowAgain: true,
  namespaceSelectIsOpen: null,
  tenantNamespaceList: [],
};

export const authReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_SUCCESS:
      return { ...state, user: action.user };
    case AuthActionTypes.LOGIN_FAILURE:
      return { ...state, user: null };
    case AuthActionTypes.SET_OAUTH_META:
      return { ...state, oauthMeta: action.oauthMeta };
    case AuthActionTypes.SET_IS_ADMIN:
      return { ...state, isAdmin: action.hasAdmin };
    case AuthActionTypes.CERT_ERROR_OCCURRED:
      return { ...state, certError: { failedUrl: action.failedUrl } };
    case AuthActionTypes.SET_WELCOME_SCREEN_BOOL:
      return { ...state, isShowAgain: !action.isShowAgain };
    case AuthActionTypes.SET_NAMESPACE_SELECT_IS_OPEN:
      return { ...state, namespaceSelectIsOpen: action.namespaceSelectIsOpen };
    case AuthActionTypes.FETCH_TENANT_NAMESPACES_SUCCESS:
      return { ...state, tenantNamespaceList: action.tenantNamespaceList };

    default:
      return state;
  }
};

export default authReducer;
