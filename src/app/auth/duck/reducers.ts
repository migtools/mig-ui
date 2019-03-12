import Types from "./types";
import { createReducer } from "reduxsauce";
export const INITIAL_STATE = {
  username: "",
  token: "",
  loggingIn: false,
  loggedIn: false
};

export const requestToken = (state = INITIAL_STATE) => {
  return { ...state, loggingIn: true };
};
export const receiveToken = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    loggingIn: false,
    token: action.token,
    username: action.username,
    loggedIn: true
  };
};
export const failedToken = (state = INITIAL_STATE, action) => {
  return { ...state, loggingIn: false, token: action.token };
};

export const HANDLERS = {
  [Types.REQUEST_TOKEN]: requestToken,
  [Types.RECEIVE_TOKEN]: receiveToken,
  [Types.FAILED_TOKEN]: failedToken
};

export default createReducer(INITIAL_STATE, HANDLERS);
