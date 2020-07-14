import React, { useEffect } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { AuthActions } from './duck/actions';

interface ILoginHandlerComponentProps {
  storeLoginToken: (user: object) => void; // TODO give user a real type
}

const LoginHandlerComponent: React.FunctionComponent<ILoginHandlerComponentProps> = ({
  storeLoginToken,
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
      /////// TODO handle errors?
    } else if (user) {
      storeLoginToken(user); // Will cause a redirect to "/"
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
