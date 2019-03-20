import { connect } from 'react-redux';
import LoginComponent from './LoginComponent';
import { authOperations } from './duck';

export default connect(
  state => ({
    loggingIn: state.auth.loggingIn,
  }),
  dispatch => ({
    onLogin: (username, password) =>
      dispatch(authOperations.loginRequest(username, password)),
    setOAuthToken: user => dispatch(authOperations.setOAuthTokenRequest(user)),
  }),
)(LoginComponent);
