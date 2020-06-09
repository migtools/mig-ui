// NATODO do we need all of these? figure out the CRUD/polling

import { IToken } from './types';

export const TokenActionTypes = {
  MIG_TOKEN_FETCH_REQUEST: 'MIG_TOKEN_FETCH_REQUEST',
  MIG_TOKEN_FETCH_SUCCESS: 'MIG_TOKEN_FETCH_SUCCESS',
  MIG_TOKEN_FETCH_FAILURE: 'MIG_TOKEN_FETCH_FAILURE',
  // NATODO actions for add/edit status?
  UPDATE_TOKEN_REQUEST: 'UPDATE_TOKEN_REQUEST',
  UPDATE_TOKEN_SUCCESS: 'UPDATE_TOKEN_SUCCESS',
  UPDATE_TOKEN_FAILURE: 'UPDATE_TOKEN_FAILURE',
  ADD_TOKEN_REQUEST: 'ADD_TOKEN_REQUEST',
  ADD_TOKEN_SUCCESS: 'ADD_TOKEN_SUCCESS',
  ADD_TOKEN_FAILURE: 'ADD_TOKEN_FAILURE',
  REMOVE_TOKEN_REQUEST: 'REMOVE_TOKEN_REQUEST',
  REMOVE_TOKEN_SUCCESS: 'REMOVE_TOKEN_SUCCESS',
  REMOVE_TOKEN_FAILURE: 'REMOVE_TOKEN_FAILURE',
  UPDATE_TOKENS: 'UPDATE_TOKENS',
  TOKEN_POLL_START: 'TOKEN_POLL_START',
  TOKEN_POLL_STOP: 'TOKEN_POLL_STOP',
};

// NATODO what can we abstract out here? Take lessons from Migration Analytics?

const migTokenFetchRequest = () => ({
  type: TokenActionTypes.MIG_TOKEN_FETCH_REQUEST,
});

const migTokenFetchSuccess = (tokenList: IToken[]) => ({
  type: TokenActionTypes.MIG_TOKEN_FETCH_SUCCESS,
  tokenList,
});

const migTokenFetchFailure = () => ({
  type: TokenActionTypes.MIG_TOKEN_FETCH_FAILURE,
});

// NATODO etc, for the other actions
