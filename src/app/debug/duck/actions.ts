import { IDebugTreeNode } from './types';
import { IPlan } from '../../plan/duck/types';
import { IDecompDebugObject } from './types';

export const DebugActionTypes = {
  DEBUG_TREE_FETCH_REQUEST: 'DEBUG_TREE_FETCH_REQUEST',
  DEBUG_TREE_FETCH_SUCCESS: 'DEBUG_TREE_FETCH_SUCCESS',
  DEBUG_TREE_FETCH_FAILURE: 'DEBUG_TREE_FETCH_FAILURE',
  DEBUG_OBJECT_FETCH_REQUEST: 'DEBUG_OBJECT_FETCH_REQUEST',
  DEBUG_OBJECT_FETCH_SUCCESS: 'DEBUG_OBJECT_FETCH_SUCCESS',
  DEBUG_OBJECT_FETCH_FAILURE: 'DEBUG_OBJECT_FETCH_FAILURE',
};

const debugTreeFetchRequest = (plan: IPlan) => ({
  type: DebugActionTypes.DEBUG_TREE_FETCH_REQUEST,
  plan,
});

const debugTreeFetchSuccess= (tree: IDebugTreeNode) => ({
  type: DebugActionTypes.DEBUG_TREE_FETCH_SUCCESS,
  tree,
});

const debugTreeFetchFailure= (errMsg: string) => ({
  type: DebugActionTypes.DEBUG_TREE_FETCH_FAILURE,
  errMsg,
});

const debugObjectFetchRequest = (rawPath: string) => ({
  type: DebugActionTypes.DEBUG_OBJECT_FETCH_REQUEST,
  rawPath,
});

const debugObjectFetchSuccess= (objJson) => ({
  type: DebugActionTypes.DEBUG_OBJECT_FETCH_SUCCESS,
  objJson,
});

const debugObjectFetchFailure= (errMsg: string) => ({
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
