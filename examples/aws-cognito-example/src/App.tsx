import React from "react";
import "./App.css";

import { AWS_COGNITO_LOGIN_PARAMS, AWS_COGNITO_LOGIN_ROUTE } from "./config";

interface IState {}

interface IProps {}

class App extends React.Component<IProps, IState> {
  login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const finalUrl = new URL(AWS_COGNITO_LOGIN_ROUTE);
      const finalJwtParams = JSON.parse(JSON.stringify(AWS_COGNITO_LOGIN_PARAMS));
      Object.keys(finalJwtParams).forEach((key) => {
        if (finalJwtParams[key]) finalUrl.searchParams.append(key, finalJwtParams[key]);
      });
      window.location.href = finalUrl.href;
    } catch (error) {
      console.error(error, "login caught");
    }
  };

  render() {
    return (
      <div className="App">
        <form onSubmit={this.login}>
          <div style={{ marginTop: "20px" }}>
            <button>Login with Torus direct auth sdk X Aws Cognito</button>
          </div>
        </form>
      </div>
    );
  }
}

export default App;
