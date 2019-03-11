import { userConstants } from "../constants";
import { userService } from "../services";
import { alertActions } from "./";
import { push } from 'connected-react-router'

export const userActions = {
  login,
  logout
};

function login(username, password) {
  return dispatch => {
    dispatch(request({ username }));
    const loginCreds = {
      username: username,
      password: password
    };

    // userService.login(loginCreds).then(
    //   user => {
    //     dispatch(success(user));
    //     localStorage.setItem("currentUser", user.data.value);

    //     history.push("/");
    //   },
    //   error => {
    //     dispatch(failure(error));
    //     dispatch(alertActions.error(error));
    //   }
    // );

    // mock login
    const user = "ibolton";
    dispatch(success(user));
    localStorage.setItem("currentUser", user);
    dispatch(push("/"));
  };

  function request(user) {
    return { type: userConstants.LOGIN_REQUEST, user };
  }
  function success(user) {
    return { type: userConstants.LOGIN_SUCCESS, user };
  }
  function failure(error) {
    return { type: userConstants.LOGIN_FAILURE, error };
  }
}

function logout() {
  userService.logout();
  return { type: userConstants.LOGOUT };
}
