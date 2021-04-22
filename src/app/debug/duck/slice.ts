import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDebugRefRes, IDebugTreeNode } from './types';

export interface IDebugReducerState {
  tree: IDebugTreeNode;
  objJson: any;
  errMsg: string;
  isLoading: boolean;
  isPolling: boolean;
  debugRefs: IDebugRefRes[];
  isFetchingInitialDebugTree: boolean;
  isLoadingJSONObject: boolean;
}

const initialState = {
  isFetchingInitialDebugTree: true,
  isLoading: false,
  isPolling: false,
  tree: null,
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
      reducer: (
        state,
        action: PayloadAction<{ tree: IDebugTreeNode; debugRefs: IDebugRefRes[] }>
      ) => {
        state.isLoading = false;
        state.isFetchingInitialDebugTree = false;
        state.tree = action.payload.tree;
        state.debugRefs = action.payload.debugRefs;
      },
      prepare: (tree: IDebugTreeNode, debugRefs: IDebugRefRes[]) => {
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
      state.isLoadingJSONObject = true;
    },
    debugObjectFetchSuccess(state, action: PayloadAction<any>) {
      state.isLoadingJSONObject = false;
      state.objJson = action.payload;
    },
    debugObjectFetchFailure(state, action: PayloadAction<string>) {
      state.isLoadingJSONObject = false;
      state.errMsg = action.payload.trim();
    },
    startDebugPolling(state, action: PayloadAction<string>) {
      state.isPolling = true;
    },
    stopDebugPolling(state, action: PayloadAction<string>) {
      state.isPolling = false;
      state.isFetchingInitialDebugTree = true;
    },
    clearJSONView(state, action: PayloadAction<string>) {
      state.objJson = null;
      state.isLoadingJSONObject = false;
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
  clearJSONView,
} = debugSlice.actions;
export default debugSlice.reducer;
