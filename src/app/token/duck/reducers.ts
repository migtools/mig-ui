import { TokenActionTypes } from './actions';
import { IToken } from './types';
import { IAddEditStatus, defaultAddEditStatus } from '../../common/add_edit_state';

export interface ITokenReducerState {
  isPolling: boolean;
  isError: boolean;
  isFetching: boolean;
  tokenList: IToken[];
  isFetchingInitialTokens: boolean;
  tokenAddEditStatus: IAddEditStatus;
  // NATODO searchTerm? other state?
}

type TokenReducerFn = (state: ITokenReducerState, action: any) => ITokenReducerState;

export const INITIAL_STATE: ITokenReducerState = {
  isPolling: false,
  isError: false,
  isFetching: false,
  tokenList: [],
  isFetchingInitialTokens: true,
  tokenAddEditStatus: defaultAddEditStatus(),
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
  [TokenActionTypes.ADD_TOKEN_SUCCESS]: (state = INITIAL_STATE, action) => {
    return { ...state, tokenList: [...state.tokenList, action.newMigToken] };
  },
  [TokenActionTypes.TOKEN_POLL_START]: (state = INITIAL_STATE) => {
    return { ...state, isPolling: true };
  },
  [TokenActionTypes.TOKEN_POLL_STOP]: (state = INITIAL_STATE, action) => {
    return { ...state, isPolling: false };
  },
  [TokenActionTypes.UPDATE_TOKENS]: (state = INITIAL_STATE, action) => {
    return {
      ...state,
      isFetchingInitialTokens: false,
      tokenList: action.updatedTokens,
    };
  },
  [TokenActionTypes.UPDATE_TOKEN_SUCCESS]: (state = INITIAL_STATE, action) => {
    return {
      ...state,
      tokenList: [
        ...state.tokenList.filter(
          (t) => t.MigToken.metadata.name !== action.updatedToken.metadata.name
        ),
        { ...action.updatedToken },
      ],
      isFetchingInitialTokens: false,
    };
  },
  [TokenActionTypes.SET_TOKEN_ADD_EDIT_STATUS]: (state = INITIAL_STATE, action) => {
    return {
      ...state,
      tokenAddEditStatus: action.status,
    };
  },

  // NATODO add handlers for the other actions
};

export const tokenReducer: TokenReducerFn = (state = INITIAL_STATE, action) => {
  const handler = tokenActionHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export default tokenReducer;
