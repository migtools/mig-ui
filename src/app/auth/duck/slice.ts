import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ILoginParams, IMigMeta } from './types';

export interface IAuthReducerState {
  user: ILoginParams;
  authError: string;
  migMeta: IMigMeta;
}

const initialState = {
  user: null,
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
  authErrorOccurred,
  initMigMeta,
  storeLoginToken,
  initFromStorage,
  logoutUserRequest,
} = authSlice.actions;
export default authSlice.reducer;
