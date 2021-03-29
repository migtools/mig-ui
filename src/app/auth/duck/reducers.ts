import { AuthActionTypes } from './actions';
import { IMigMeta, ILoginParams } from './types';

export interface IAuthReducerState {
  user: ILoginParams;
  authError: string;
  certError: {
    failedUrl: string;
  };
  migMeta: IMigMeta;
}

type AuthReducerFn = (state: IAuthReducerState, action: any) => IAuthReducerState;

const INITIAL_STATE: IAuthReducerState = {
  user: null,
  certError: null,
  authError: null,
  migMeta: {},
};

export const authReducer: AuthReducerFn = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_SUCCESS:
      return { ...state, user: action.user };
    case AuthActionTypes.LOGIN_FAILURE:
      return { ...state, user: null };
    case AuthActionTypes.CERT_ERROR_OCCURRED:
      return { ...state, certError: { failedUrl: action.failedUrl } };
    case AuthActionTypes.AUTH_ERROR_OCCURRED:
      return { ...state, authError: action.authError };
    case AuthActionTypes.INIT_MIG_META:
      return { ...state, migMeta: action.migMeta };
    default:
      return state;
  }
};

export default authReducer;
