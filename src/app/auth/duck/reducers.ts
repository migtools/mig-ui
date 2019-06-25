import { createReducer } from 'reduxsauce';
import { Types } from './actions';

const initialState = {
  user: null,
  oauthMeta: null,
  certError: null,
};

export default createReducer(initialState, {
  [Types.LOGIN_SUCCESS]: (state = initialState, action) => {
    return { ...state, user: action.user };
  },
  [Types.LOGIN_FAILURE]: (state = initialState, action) => {
    return { ...state, user: null };
  },
  [Types.SET_OAUTH_META]: (state = initialState, action) => {
    return { ...state, oauthMeta: action.oauthMeta };
  },
  [Types.CERT_ERROR_OCCURRED]: (state, action) => {
    return { ...state, certError: { failedUrl: action.failedUrl } };
  },
});
