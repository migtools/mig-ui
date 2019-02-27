import React, { Component } from "react";
import { connect } from "react-redux";
import { userActions } from "../../_actions";
import {
  Form,
  FormGroup,
  TextInput,
  Checkbox,
  ActionGroup,
  Button,
  Radio
} from "@patternfly/react-core";
import ReactLoading from "react-loading";
import "./LoginForm.css";
interface LoginProps {
  handleSubmit: any;
  loggingIn: boolean;
  dispatch: any;
}

interface LoginState {
  username: string;
  password: string;
  submitted: boolean;
}

class LoginForm extends Component<LoginProps, LoginState> {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      submitted: false
    };
  }

  handleFormSubmit = e => {
    e.preventDefault();
    this.setState({ submitted: true });
    const { username, password } = this.state;
    const { dispatch } = this.props;
    if (username && password) {
      dispatch(userActions.login(username, password));
    }
  };

  //typescript dynamic key name type-safe workaround function
  updateState = <T extends string>(key: keyof LoginState, value: T) => (
    prevState: LoginState
  ): LoginState => ({
    ...prevState,
    [key]: value
  });

  handleChange = (val, e) => {
    const { name, value } = e.target;
    this.setState(this.updateState(name, value));
  };

  render() {
    const { username, password, submitted } = this.state;
    return (
      <Form>
        <FormGroup
          label="Username"
          isRequired
          fieldId="username"
          // helperText="Please provide your username"
        >
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
        <ActionGroup>
          <Button
            id="submit-button"
            className="submit-button"
            variant="primary"
            onClick={this.handleFormSubmit}
          >
            Login
          </Button>
          {this.props.loggingIn && <ReactLoading type="spin" color="#fff" />}
          <Button variant="secondary">Cancel</Button>
        </ActionGroup>
      </Form>
    );
  }
}

function mapStateToProps(state) {
  const { loggingIn } = state.authentication;
  return {
    loggingIn
  };
}

const connectedLoginForm = connect(mapStateToProps)(LoginForm);
export { connectedLoginForm as LoginForm };
