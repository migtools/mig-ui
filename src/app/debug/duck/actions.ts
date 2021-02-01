import { IDebugTreeNode } from './types';

export const DebugActionTypes = {
  DEBUG_TREE_FETCH_REQUEST: 'DEBUG_TREE_FETCH_REQUEST',
  DEBUG_TREE_FETCH_SUCCESS: 'DEBUG_TREE_FETCH_SUCCESS',
  DEBUG_TREE_FETCH_FAILURE: 'DEBUG_TREE_FETCH_FAILURE',
  DEBUG_OBJECT_FETCH_REQUEST: 'DEBUG_OBJECT_FETCH_REQUEST',
  DEBUG_OBJECT_FETCH_SUCCESS: 'DEBUG_OBJECT_FETCH_SUCCESS',
  DEBUG_OBJECT_FETCH_FAILURE: 'DEBUG_OBJECT_FETCH_FAILURE',
};

const debugTreeFetchRequest = (planName: string) => ({
  type: DebugActionTypes.DEBUG_TREE_FETCH_REQUEST,
  planName,
});

const debugTreeFetchSuccess = (tree: IDebugTreeNode, debugRefs: any) => ({
  type: DebugActionTypes.DEBUG_TREE_FETCH_SUCCESS,
  tree,
  debugRefs,
});

const debugTreeFetchFailure = (errMsg: string) => ({
  type: DebugActionTypes.DEBUG_TREE_FETCH_FAILURE,
  errMsg,
});

const debugObjectFetchRequest = (rawPath: string) => ({
  type: DebugActionTypes.DEBUG_OBJECT_FETCH_REQUEST,
  rawPath,
});

const debugObjectFetchSuccess = (objJson) => ({
  type: DebugActionTypes.DEBUG_OBJECT_FETCH_SUCCESS,
  objJson,
});

const debugObjectFetchFailure = (errMsg: string) => ({
  type: DebugActionTypes.DEBUG_OBJECT_FETCH_FAILURE,
  errMsg,
});

export const DebugActions = {
  debugTreeFetchRequest,
  debugTreeFetchSuccess,
  debugTreeFetchFailure,
  debugObjectFetchRequest,
  debugObjectFetchSuccess,
  debugObjectFetchFailure,
};
