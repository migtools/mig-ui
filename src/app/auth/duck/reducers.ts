import { createReducer } from 'reduxsauce';
import { Types } from './actions';
import { ErrorTypes } from './errorActions';

const initialState = {
  user: null,
  oauthMeta: null,
  certError: null,
};

export default createReducer(initialState, {
  [Types.LOGIN_SUCCESS]: (state = initialState, action) => {
    return { ...state, user: action.user };
  },
  [Types.LOGIN_FAILURE]: (state = initialState, _action) => {
    return { ...state, user: null };
  },
  [Types.SET_OAUTH_META]: (state = initialState, action) => {
    return { ...state, oauthMeta: action.oauthMeta };
  },
  [ErrorTypes.CERT_ERROR_OCCURRED]: (state, action) => {
    return { ...state, certError: { failedUrl: action.failedUrl } };
  },
});
