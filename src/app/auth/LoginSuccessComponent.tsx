import React, { useEffect } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { AuthActions } from './duck/actions';

interface ILoginSuccessComponentProps {
  storeLoginToken: (user: object) => void; // TODO give user a real type
}

const LoginSuccessComponent: React.FunctionComponent<ILoginSuccessComponentProps> = ({
  storeLoginToken,
}) => {
  const searchParams = new URLSearchParams(useLocation().search);
  const userStr = searchParams.get('user');
  let user;
  try {
    user = userStr && JSON.parse(userStr);
  } catch (error) {
    user = null;
  }

  useEffect(() => {
    if (user) storeLoginToken(user); // Will cause a redirect to "/"
  }, []);

  return user ? null : <Redirect to="/" />;
};

export default connect(
  (state) => ({}),
  (dispatch) => ({
    saveLoginToken: (user) => dispatch(AuthActions.storeLoginToken(user)),
  })
)(LoginSuccessComponent);
