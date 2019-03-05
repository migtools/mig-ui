import React from "react";
import { LoginForm } from "../../LoginForm";
import "./index.css";

export default class LoginPage extends React.Component<any, any> {
  render() {
    return (
      <div className="login-container">
        <LoginForm />;
      </div>
    );
  }
}
