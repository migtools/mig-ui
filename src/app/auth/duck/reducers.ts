import Types from "./types";
import { createReducer } from "reduxsauce";
const user = JSON.parse(localStorage.getItem("currentUser"));
export const INITIAL_STATE = user
  ? {
      user: user.email || user.name,
      loggingIn: false,
      loggedIn: true,
      store: null,
      status: ""
    }
  : {};

export const login = (state = INITIAL_STATE, action) => {
  return { ...state, loggingIn: true, user: action.user };
};
export const loginSuccess = (state = INITIAL_STATE, action) => {
  return {
    ...state,
    loggingIn: false,
    user: action.user
  };
};
export const loginFailure = (state = INITIAL_STATE, action) => {
  return {};
};

export const logout = (state = INITIAL_STATE, action) => {
  return {};
};

export const HANDLERS = {
  [Types.LOGIN]: login,
  [Types.LOGOUT]: logout,
  [Types.LOGIN_SUCCESS]: loginSuccess,
  [Types.LOGIN_FAILURE]: loginFailure
};

export default createReducer(INITIAL_STATE, HANDLERS);
