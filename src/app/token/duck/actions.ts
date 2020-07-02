import { IToken, ITokenFormValues } from './types';

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
  SET_TOKEN_ADD_EDIT_STATUS: 'SET_TOKEN_ADD_EDIT_STATUS',
  WATCH_TOKEN_ADD_EDIT_STATUS: 'WATCH_TOKEN_ADD_EDIT_STATUS',
  CANCEL_WATCH_TOKEN_ADD_EDIT_STATUS: 'CANCEL_WATCH_TOKEN_ADD_EDIT_STATUS',
};

// NATODO what can we abstract out here? Take lessons from Migration Analytics?
const addTokenRequest = (tokenValues: ITokenFormValues) => ({
  type: TokenActionTypes.ADD_TOKEN_REQUEST,
  tokenValues,
});

const addTokenSuccess = (newMigToken: IToken) => ({
  type: TokenActionTypes.ADD_TOKEN_SUCCESS,
  newMigToken,
});

const addTokenFailure = (error) => ({
  type: TokenActionTypes.ADD_TOKEN_FAILURE,
  error,
});

const updateTokens = (updatedTokens: IToken[]) => ({
  type: TokenActionTypes.UPDATE_TOKENS,
  updatedTokens,
});

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

const startTokenPolling = (params) => ({
  type: TokenActionTypes.TOKEN_POLL_START,
  params,
});

const stopTokenPolling = () => ({
  type: TokenActionTypes.TOKEN_POLL_STOP,
});

const removeTokenRequest = (name) => ({
  type: TokenActionTypes.REMOVE_TOKEN_REQUEST,
  name,
});

const removeTokenSuccess = (name) => ({
  type: TokenActionTypes.REMOVE_TOKEN_SUCCESS,
  name,
});

const removeTokenFailure = (err) => ({
  type: TokenActionTypes.REMOVE_TOKEN_FAILURE,
  err,
});

// NATODO: Implement and/or remove unecessary copies
export const TokenActions = {
  removeTokenRequest,
  removeTokenSuccess,
  removeTokenFailure,
  // updateClusterSuccess,
  // updateSearchTerm,
  // setClusterAddEditStatus,
  // watchClusterAddEditStatus,
  // cancelWatchClusterAddEditStatus,
  // clusterFetchSuccess,
  // clusterFetchRequest,
  // clusterFetchFailure,
  // updateClusterRequest,
  addTokenSuccess,
  addTokenFailure,
  addTokenRequest,
  updateTokens,
  startTokenPolling,
  stopTokenPolling,
};
