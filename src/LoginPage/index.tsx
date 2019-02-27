import React from "react";
import { LoginForm } from "../_components/LoginForm";
import "./LoginPage.css";
export class LoginPage extends React.Component {
  render() {
    return (
      <div className="login-container">
        <LoginForm />;
      </div>
    );
  }
}
