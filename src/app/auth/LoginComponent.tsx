import React from "react";
import {
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
  Button
} from "@patternfly/react-core";
import "./LoginComponent.css";
var Spinner = require("react-spinkit");

const openShiftLogo = require("../../assets/OpenShiftLogo.svg");
const twitterLogo = require("../../assets/twitter.svg");
//uncomment for oauth
// import io from "socket.io-client";
// const socket = io(SOCKET_API_URL);
const provider = "twitter";
import { JWT_API_URL, SOCKET_API_URL } from "../../config";

interface LoginState {
  username: string;
  password: string;
  submitted: boolean;
  disabled: boolean;
}
class LoginComponent extends React.Component<any, any> {
  state = {
    username: "",
    password: "",
    submitted: false,
    disabled: null
  };

  popup = null;
  componentDidMount() {
    //uncomment for oauth
    // socket.on(provider, user => {
    //   this.popup.close();
    //   // this.setState({ user });
    //   this.props.setOAuthToken(user);
    // });
  }
  handleFormSubmit = e => {
    e.preventDefault();
    this.setState({ submitted: true });
    const { username, password } = this.state;
    if (username && password) {
      this.props.onLogin(username, password, false);
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
  checkPopup() {
    // uncomment for oauth
    // const check = setInterval(() => {
    //   const { popup } = this;
    //   if (!popup || popup.closed || popup.closed === undefined) {
    //     clearInterval(check);
    //     // this.setState({ disabled: "" });
    //   }
    // }, 1000);
  }
  //uncomment for oauth

  // startAuth = () => {
  //   if (!this.state.disabled) {
  //     this.popup = this.openPopup();
  //     this.checkPopup();
  //     // this.setState({ disabled: "disabled" });
  //   }
  // };
  // openPopup = () => {
  //   const width = 600,
  //     height = 600;
  //   const left = window.innerWidth / 2 - width / 2;
  //   const top = window.innerHeight / 2 - height / 2;
  //   const url = `${SOCKET_API_URL}/${provider}?socketId=${socket.id}`;

  //   return window.open(
  //     url,
  //     "",
  //     `toolbar=no, location=no, directories=no, status=no, menubar=no,
  //     scrollbars=no, resizable=no, copyhistory=no, width=${width},
  //     height=${height}, top=${top}, left=${left}`
  //   );
  // };

  render() {
    const { username, password, submitted } = this.state;
    const { loggingIn } = this.props;
    return (
      <div className="login-container">
        <div className="social">
          <h4 className="connect-label">Connect with</h4>
          <div className="social-links">
            {/* <div className="social-link">
              <Button variant="link" onClick={() => this.startAuth()}>
                <img className="twitter-logo" src={twitterLogo} alt="Logo" />
              </Button>
            </div> */}
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

        {loggingIn && <Spinner name="double-bounce" />}
      </div>
    );
  }
}
export default LoginComponent;
