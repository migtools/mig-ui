import React, { useEffect } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { authErrorOccurred, storeLoginToken } from './duck/slice';

const LoginHandlerComponent: React.FunctionComponent = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(useLocation().search);
  const userStr = searchParams.get('user');
  const errorStr = searchParams.get('error');
  let user;
  let loginError;
  try {
    user = userStr && JSON.parse(userStr);
    loginError = errorStr && JSON.parse(errorStr);
  } catch (error) {
    user = null;
    loginError = null;
  }

  useEffect(() => {
    if (loginError) {
      console.log('Authentication error: ', loginError.message);
      dispatch(authErrorOccurred(loginError.message)); // Will cause a redirect to "/auth-error
      history.push('/auth-error');
    } else if (user) {
      dispatch(storeLoginToken(user)); // Will cause a redirect to "/"
    }
  }, []);

  return user ? null : <Redirect to="/" />;
};

export default LoginHandlerComponent;
