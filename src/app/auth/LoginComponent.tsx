import React from 'react';
import { connect } from 'react-redux';
import {
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
  Button,
} from '@patternfly/react-core';
import { authOperations } from './duck';
import './LoginComponent.css';

import openShiftLogo from '../../assets/OpenShiftLogo.svg';
interface IState {
  username: string;
  password: string;
  submitted?: boolean;
  disabled?: boolean;
}

interface IProps {
  loggingIn?: boolean;
  onLogin: (username: string, password: string) => void;
  setOAuthToken: (user: object) => void;
}

class LoginComponent extends React.Component<IProps, IState> {
  state = {
    username: '',
    password: '',
    submitted: false,
    disabled: null,
  };

  handleFormSubmit = e => {
    e.preventDefault();
    this.setState({ submitted: true });
    const { username, password } = this.state;
    if (username && password) {
      this.props.onLogin(username, password);
    }
  }

  updateState = <T extends string>(key: keyof IState, value: T) => (
    prevState: IState,
  ): IState => ({
    ...prevState,
    [key]: value,
  })

  handleChange = (val, e) => {
    const { name, value } = e.target;
    this.setState(this.updateState(name, value));
  }

  render() {
    const { username, password, submitted } = this.state;
    const { loggingIn } = this.props;
    return (
      <div className="login-container">
        <div className="social">
          <h4 className="connect-label">Connect with</h4>
          <div className="social-links">
            <div className="social-link">
              <Button variant="link">
                <img
                  className="openshift-logo"
                  src={openShiftLogo}
                  alt="Logo"
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="divider">
          <span>or</span>
        </div>
        <Form>
          <FormGroup label="Username" isRequired fieldId="username">
            <TextInput
              isRequired
              type="text"
              id="username"
              name="username"
              aria-describedby="username"
              value={username}
              onChange={this.handleChange}
            />
            {submitted && !username && (
              <div className="help-block">Username is required</div>
            )}
          </FormGroup>
          <FormGroup label="Password" isRequired fieldId="password">
            <TextInput
              isRequired
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={this.handleChange}
            />
            {submitted && !password && (
              <div className="help-block">Password is required</div>
            )}
          </FormGroup>
          <div className="form-buttons">
            <ActionGroup>
              <Button
                id="submit-button"
                className="submit-button"
                variant="primary"
                onClick={this.handleFormSubmit}
              >
                Login
              </Button>
              <Button variant="secondary">Cancel</Button>
            </ActionGroup>
          </div>
        </Form>
        <div className="container" />
      </div>
    );
  }
}

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
