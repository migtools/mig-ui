import { TokenActionTypes } from './actions';
import { IToken } from './types';

export interface ITokenReducerState {
  isPolling: boolean;
  isError: boolean;
  isFetching: boolean;
  tokenList: IToken[];
  // NATODO searchTerm? addEditStatus?
}

type TokenReducerFn = (state: ITokenReducerState, action: any) => ITokenReducerState;

export const INITIAL_STATE: ITokenReducerState = {
  isPolling: false,
  isError: false,
  isFetching: false,
  tokenList: [],
};

// NATODO what can we abstract out here? Take lessons from Migration Analytics?

export const tokenFetchRequest: TokenReducerFn = (state = INITIAL_STATE, action) => {
  return { ...state, isFetching: true };
};

export const tokenFetchSuccess: TokenReducerFn = (state = INITIAL_STATE, action) => {
  return { ...state, tokenList: action.tokenList, isFetching: false };
};

export const tokenFetchFailure: TokenReducerFn = (state = INITIAL_STATE, action) => {
  return { ...state, isError: true, isFetching: false };
};

// NATODO etc, for the other actions

export const tokenReducer: TokenReducerFn = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case TokenActionTypes.MIG_TOKEN_FETCH_REQUEST:
      return tokenFetchRequest(state, action);
    case TokenActionTypes.MIG_TOKEN_FETCH_SUCCESS:
      return tokenFetchSuccess(state, action);
    case TokenActionTypes.MIG_TOKEN_FETCH_FAILURE:
      return tokenFetchFailure(state, action);
    default:
      return state;
  }
};

export default tokenReducer;
