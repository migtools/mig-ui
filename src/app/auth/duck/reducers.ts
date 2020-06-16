import { AuthActionTypes } from './actions';

const INITIAL_STATE = {
  user: null,
  oauthMeta: null,
  certError: null,
  isAdmin: null,
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
    default:
      return state;
  }
};

export default authReducer;
