import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDebugTreeNode } from './types';

export interface IDebugReducerState {
  tree: IDebugTreeNode;
  objJson: any;
  errMsg: string;
  isLoading: boolean;
}

const initialState = {
  isLoading: true,
  tree: null,
  objJson: null,
  errMsg: null,
} as IDebugReducerState;

const debugSlice = createSlice({
  name: 'debug',
  initialState,
  reducers: {
    treeFetchRequest(state, action: PayloadAction<string>) {
      state.isLoading = true;
    },
    treeFetchSuccess(state, action: PayloadAction<IDebugTreeNode>) {
      state.isLoading = false;
      state.tree = action.payload;
    },
    treeFetchFailure(state, action: PayloadAction<string>) {
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
  },
});

export const {
  treeFetchRequest,
  treeFetchFailure,
  treeFetchSuccess,
  debugObjectFetchFailure,
  debugObjectFetchRequest,
  debugObjectFetchSuccess,
} = debugSlice.actions;
export default debugSlice.reducer;
