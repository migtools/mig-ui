import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ILoginParams, IMigMeta } from './types';

export interface IAuthReducerState {
  user: ILoginParams;
  authError: string;
  certError: {
    failedUrl: string;
  };
  migMeta: IMigMeta;
}

const initialState = {
  user: null,
  certError: null,
  authError: null,
  migMeta: {},
} as IAuthReducerState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<ILoginParams>) {
      state.user = action.payload;
    },
    loginFailure(state, action: PayloadAction<ILoginParams>) {
      state.user = null;
    },
    certErrorOccurred(state, action: PayloadAction<any>) {
      state.certError = { failedUrl: action.payload };
    },
    authErrorOccurred(state, action: PayloadAction<string>) {
      state.authError = action.payload;
    },
    initMigMeta(state, action: PayloadAction<IMigMeta>) {
      state.migMeta = action.payload;
    },
    logoutUserRequest(state, action: PayloadAction<string>) {
      // Forward to saga
    },
    storeLoginToken(state, action: PayloadAction<ILoginParams>) {
      // Forward to saga
    },
    initFromStorage(state, action: PayloadAction<string>) {
      // Forward to saga
    },
  },
});

export const {
  loginSuccess,
  loginFailure,
  certErrorOccurred,
  authErrorOccurred,
  initMigMeta,
  storeLoginToken,
  initFromStorage,
  logoutUserRequest,
} = authSlice.actions;
export default authSlice.reducer;
