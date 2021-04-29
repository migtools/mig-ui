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
    treeFetchSuccess(state, action: PayloadAction<any>) {
      state.isLoading = false;
      state.isFetchingInitialDebugTree = false;
      state.tree = action.payload;
    },
    treeFetchFailure(state, action: PayloadAction<string>) {
      state.isFetchingInitialDebugTree = false;
      state.isLoading = false;
      state.errMsg = action.payload.trim();
    },
    debugRefsFetchRequest(state, action: PayloadAction<any>) {
      // state.isLoading = true;
    },
    debugRefsFetchSuccess(state, action: PayloadAction<IDebugRefRes[]>) {
      state.debugRefs = action.payload;
    },
    debugRefsFetchFailure(state, action: PayloadAction<any>) {
      state.isLoading = false;
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
  debugRefsFetchFailure,
  debugRefsFetchRequest,
  debugRefsFetchSuccess,
} = debugSlice.actions;
export default debugSlice.reducer;
