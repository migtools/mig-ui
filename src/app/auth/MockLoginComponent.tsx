import React from 'react';
import { connect } from 'react-redux';
import { authActionCreators } from './duck';
import { push } from 'connected-react-router';

import openShiftLogo from '../../assets/OpenShiftLogo.svg';

interface IProps {
  migMeta: any;
  auth: any;
  router: any;
  loginUser: (any) => void;
  routeToHome: () => void;
}

class LoginComponent extends React.Component<IProps> {
  componentDidMount = () => {
    this.props.loginUser({
      user: { token: 'mock', username: 'Bob' },
    });
  }

  componentDidUpdate = prevProps => {
    const newUser = !prevProps.auth.user && this.props.auth.user;
    if (newUser) {
      this.props.routeToHome();
    }
  }

  render() {
    return <div />;
  }
}

export default connect(
  state => ({
    migMeta: state.migMeta,
    auth: state.auth,
    router: state.router,
  }),
  dispatch => ({
    loginUser: user => dispatch(authActionCreators.loginSuccess(user)),
    routeToHome: () => dispatch(push('/')),
  }),
)(LoginComponent);
