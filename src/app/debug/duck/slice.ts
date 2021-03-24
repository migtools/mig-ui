import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDebugTreeNode } from './types';

export interface IDebugReducerState {
  tree: IDebugTreeNode;
  objJson: any;
  errMsg: string;
  isLoading: boolean;
  isPolling: boolean;
  debugRefs: any;
  isFetchingInitialDebugTree: boolean;
}

const initialState = {
  isFetchingInitialDebugTree: true,
  isLoading: false,
  isPolling: false,
  tree: {},
  objJson: null,
  errMsg: null,
  debugRefs: [],
} as IDebugReducerState;

const debugSlice = createSlice({
  name: 'debug',
  initialState,
  reducers: {
    treeFetchRequest(state, action: PayloadAction<string>) {
      state.isLoading = true;
    },
    treeFetchSuccess: {
      reducer: (state, action: PayloadAction<{ tree: IDebugTreeNode; debugRefs: any }>) => {
        state.isLoading = false;
        state.isFetchingInitialDebugTree = false;
        state.tree = action.payload.tree;
        state.debugRefs = action.payload.debugRefs;
      },
      prepare: (tree: IDebugTreeNode, debugRefs: any) => {
        return {
          payload: {
            tree,
            debugRefs,
          },
        };
      },
    },
    treeFetchFailure(state, action: PayloadAction<string>) {
      state.isFetchingInitialDebugTree = false;
      state.isLoading = false;
      state.errMsg = action.payload.trim();
    },
    debugObjectFetchRequest(state, action: PayloadAction<string>) {
      state.isLoading = true;
    },
    debugObjectFetchSuccess(state, action: PayloadAction<any>) {
      state.isLoading = false;
      state.objJson = action.payload;
    },
    debugObjectFetchFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.errMsg = action.payload.trim();
    },
    startDebugPolling(state, action: PayloadAction<string>) {
      state.isPolling = true;
    },
    stopDebugPolling(state, action: PayloadAction<string>) {
      state.isPolling = false;
      state.isFetchingInitialDebugTree = true;
    },
  },
});

export const {
  treeFetchRequest,
  treeFetchFailure,
  treeFetchSuccess,
  debugObjectFetchFailure,
  debugObjectFetchRequest,
  debugObjectFetchSuccess,
  startDebugPolling,
  stopDebugPolling,
} = debugSlice.actions;
export default debugSlice.reducer;
