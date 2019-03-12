import React from "react";
import {
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
  Button
} from "@patternfly/react-core";
import "./index.css";

interface LoginState {
  username: string;
  password: string;
  submitted: boolean;
}
class LoginComponent extends React.Component<any, any> {
  state = {
    username: "",
    password: "",
    submitted: false
  };
  handleFormSubmit = e => {
    e.preventDefault();
    this.setState({ submitted: true });
    const { username, password } = this.state;
    if (username && password) {
      this.props.onLogin(username, password);
    }
  };

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
      <div className="login-container">
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
        </Form>
      </div>
    );
  }
}
export default LoginComponent;
