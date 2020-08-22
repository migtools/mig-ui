import { DebugActionTypes } from './actions';
import { IDebugTreeNode } from './types';

export interface IDebugReducerState {
  isLoading: boolean;
  tree: IDebugTreeNode;
  objJson: any;
  errMsg: string;
}

function createReducer(initialState: IDebugReducerState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    } else {
      return state;
    }
  };
}

export default createReducer(
  { isLoading: true, tree: null, objJson: null, errMsg: null},
  {
    [DebugActionTypes.DEBUG_TREE_FETCH_REQUEST]: (state) => {
      return { ...state, isLoading: true };
    },
    [DebugActionTypes.DEBUG_TREE_FETCH_SUCCESS]: (state, action) => {
      return { ...state, tree: action.tree, isLoading: false };
    },
    [DebugActionTypes.DEBUG_TREE_FETCH_FAILURE]: (state, action) => {
      const errMsg = action.errMsg.trim();
      return { ...state, errMsg, isLoading: false };
    },
    [DebugActionTypes.DEBUG_OBJECT_FETCH_REQUEST]: (state) => {
      return { ...state, isLoading: true };
    },
    [DebugActionTypes.DEBUG_OBJECT_FETCH_SUCCESS]: (state, action) => {
      return { ...state, objJson: action.objJson, isLoading: false };
    },
    [DebugActionTypes.DEBUG_OBJECT_FETCH_FAILURE]: (state, action) => {
      const errMsg = action.errMsg.trim();
      return { ...state, errMsg, isLoading: false };
    },
  }
);
