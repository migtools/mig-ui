import React, { useEffect } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { AuthActions } from './duck/actions';

interface ILoginHandlerComponentProps {
  saveLoginToken: (user: object) => void;
}

const LoginHandlerComponent: React.FunctionComponent<ILoginHandlerComponentProps> = ({
  saveLoginToken,
}) => {
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
      console.log('Authentication error: ', loginError);
    } else if (user) {
      saveLoginToken(user); // Will cause a redirect to "/"
    }
  }, []);

  return user ? null : <Redirect to="/" />;
};

export default connect(
  (state) => ({}),
  (dispatch) => ({
    saveLoginToken: (user) => dispatch(AuthActions.storeLoginToken(user)),
  })
)(LoginHandlerComponent);
