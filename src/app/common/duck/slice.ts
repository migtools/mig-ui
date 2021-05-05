import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAlertModalObj } from './types';

export interface ICommonReducerState {
  successText: string;
  errorText: string;
  warnText: string;
  progressText: string;
  errorModalObject: IAlertModalObj;
}

const initialState = {
  successText: null,
  warnText: null,
  errorText: null,
  progressText: null,
  errorModalObject: null,
} as ICommonReducerState;

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    alertProgress(state, action: PayloadAction<string>) {
      state.progressText = action.payload;
    },
    alertProgressTimeout(state, action: PayloadAction<string>) {
      //Trigger saga
    },
    alertSuccess(state, action: PayloadAction<string>) {
      state.successText = action.payload;
    },
    alertSuccessTimeout(state, action: PayloadAction<string>) {
      //Trigger saga
    },
    alertError(state, action: PayloadAction<string>) {
      state.errorText = action.payload;
    },
    alertErrorTimeout(state, action: PayloadAction<string>) {
      //Trigger saga
    },
    alertWarn(state, action: PayloadAction<string>) {
      state.warnText = action.payload;
    },
    alertErrorModal(state, action: PayloadAction<IAlertModalObj>) {
      state.errorModalObject = action.payload;
    },
    errorModalClear(state, action: PayloadAction<string>) {
      state.errorModalObject = null;
    },
    alertClear(state, action: PayloadAction<string>) {
      state.progressText = null;
      state.errorText = null;
      state.warnText = null;
      state.successText = null;
    },
  },
});

export const {
  alertError,
  alertProgress,
  alertSuccess,
  alertWarn,
  alertClear,
  errorModalClear,
  alertErrorModal,
  alertErrorTimeout,
  alertProgressTimeout,
  alertSuccessTimeout,
} = commonSlice.actions;
export default commonSlice.reducer;
