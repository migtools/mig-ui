import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAlertModalObj, IVersionObject } from './types';

export interface ICommonReducerState {
  successText: string;
  errorText: string;
  warnText: string;
  progressText: string;
  errorModalObject: IAlertModalObj;
  versionObject: IVersionObject;
  versionOutOfDateString: string;
}

const initialState = {
  successText: null,
  warnText: null,
  errorText: null,
  progressText: null,
  errorModalObject: null,
  versionObject: null,
  versionOutOfDateString: null,
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
      state.versionOutOfDateString = null;
    },
    fetchMTCVersionRequest(state, action: PayloadAction<string>) {
      state.errorModalObject = null;
      state.versionOutOfDateString = null;
    },
    fetchMTCVersionSuccess(state, action: PayloadAction<IVersionObject>) {
      state.versionObject = action.payload;
      if (
        action.payload.currentVersion !==
        action.payload.versionList[action.payload.versionList.length - 1]
      ) {
        state.versionOutOfDateString = `The ${action.payload.currentVersion} is out of date. Upgrade to the latest version. The upgrade does not affect stored data.`;
      } else {
        state.versionOutOfDateString = null;
      }
    },
    fetchMTCVersionFailure(state, action: PayloadAction<string>) {
      state.versionObject = null;
      state.versionOutOfDateString = null;
    },
    fetchCraneVersionRequest(state, action: PayloadAction<string>) {
      state.errorModalObject = null;
      state.versionOutOfDateString = null;
    },
    fetchCraneVersionSuccess(state, action: PayloadAction<IVersionObject>) {
      state.versionObject = action.payload;
      if (
        action.payload.currentVersion !==
          action.payload.versionList[action.payload.versionList.length - 1] &&
        action.payload.currentVersion !== 'crane-operator.v99.0.0'
      ) {
        state.versionOutOfDateString = `The ${action.payload.currentVersion} is out of date. Upgrade to the latest version. The upgrade does not affect stored data.`;
      } else {
        state.versionOutOfDateString = null;
      }
    },
    fetchCraneVersionFailure(state, action: PayloadAction<string>) {
      state.versionObject = null;
      state.versionOutOfDateString = null;
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
  fetchMTCVersionRequest,
  fetchMTCVersionSuccess,
  fetchMTCVersionFailure,
  fetchCraneVersionRequest,
  fetchCraneVersionSuccess,
  fetchCraneVersionFailure,
} = commonSlice.actions;
export default commonSlice.reducer;
