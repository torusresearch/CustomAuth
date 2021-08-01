import React from "react";
import jwtDecode from "jwt-decode";
import TorusDirectSdk, { TorusKey } from "@toruslabs/torus-direct-web-sdk";
import { AWS_COGNITO_LOGOUT_ROUTE, AWS_COGNITO_LOGOUT_PARAMS, TORUS_DIRECT_SDK_VERIFIER_NAME } from "./config";
import "./App.css";

interface IState {
  consoleText: string;
}

interface IProps {}

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      consoleText: "",
    };
  }

  componentDidMount = async () => {
    try {
      const url = new URL(window.location.href);
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState(null, "", cleanUrl);
      const hash = url.hash.substr(1);
      const { error, hashParameters } = this.handleRedirectParameters(hash);
      if (error) {
        this.setState({ consoleText: error });
        return;
      }
      const torusKeyResult = await this.getTorusKeyResult(hashParameters);
      console.log(torusKeyResult);
      if (torusKeyResult) {
        this.setState({ consoleText: typeof torusKeyResult === "object" ? JSON.stringify(torusKeyResult) : torusKeyResult });
      }
    } catch (error) {
      console.log(error);
      this.setState({ consoleText: error.message });
    }
  };

  handleRedirectParameters = (hash: string): { error: string; hashParameters: Record<string, string> } => {
    const hashParameters: Record<string, string> = hash.split("&").reduce((result: Record<string, string>, item) => {
      const [part0, part1] = item.split("=");
      result[part0] = part1;
      return result;
    }, {});
    let error = "";
    if (Object.keys(hashParameters).length > 0) {
      error = hashParameters.error_description || hashParameters.error || error;
    }
    return { error, hashParameters };
  };

  getTorusKeyResult = async (loginResponse: Record<string, string>): Promise<TorusKey | undefined> => {
    const torusdirectsdk = new TorusDirectSdk({
      baseUrl: `${window.location.origin}`,
      redirectPathName: "/",
      enableLogging: true,
      network: "testnet", // details for test net
    });
    console.log(loginResponse);
    const idToken = loginResponse.id_token;
    const decodedToken = jwtDecode(idToken) as any;
    console.log(decodedToken, torusdirectsdk);
    return torusdirectsdk?.getTorusKey(
      TORUS_DIRECT_SDK_VERIFIER_NAME,
      decodedToken.email,
      { verifier_id: decodedToken.email },
      loginResponse.id_token
    );
  };

  logout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const finalUrl = new URL(AWS_COGNITO_LOGOUT_ROUTE);
      const finalJwtParams = JSON.parse(JSON.stringify(AWS_COGNITO_LOGOUT_PARAMS));
      Object.keys(finalJwtParams).forEach((key) => {
        if (finalJwtParams[key]) finalUrl.searchParams.append(key, finalJwtParams[key]);
      });
      window.location.href = finalUrl.href;
    } catch (error) {
      console.error(error, "login caught");
    }
  };

  render() {
    const { consoleText } = this.state;
    return (
      <div className="App">
        <form onSubmit={this.logout}>
          <div style={{ marginTop: "20px" }}>
            <button>Logout</button>
          </div>
        </form>
        <div className="console">
          <p> {consoleText} </p>
        </div>
      </div>
    );
  }
}

export default App;
