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

// NATODO how do we like this structure? maybe refactor other reducers to use it?
// One benefit is it allows us to abstract out common patterns for initial state and action handlers and spread them into this object.
// See https://github.com/RedHatCloudForms/cfme-migration_analytics/blob/master/app/javascript/react/screens/App/Analytics/redux/analyticsReducer.js

const tokenActionHandlers: { [actionType: string]: TokenReducerFn } = {
  [TokenActionTypes.MIG_TOKEN_FETCH_REQUEST]: (state = INITIAL_STATE, action) => {
    return { ...state, isFetching: true };
  },
  [TokenActionTypes.MIG_TOKEN_FETCH_SUCCESS]: (state = INITIAL_STATE, action) => {
    return { ...state, tokenList: action.tokenList, isFetching: false };
  },
  [TokenActionTypes.MIG_TOKEN_FETCH_FAILURE]: (state = INITIAL_STATE, action) => {
    return { ...state, isError: true, isFetching: false };
  },
  // NATODO add handlers for the other actions
};

export const tokenReducer: TokenReducerFn = (state = INITIAL_STATE, action) => {
  const handler = tokenActionHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export default tokenReducer;
