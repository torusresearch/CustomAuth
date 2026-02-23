import React from "react";
import "../App.css";
import { CustomAuth, RedirectResult } from "@toruslabs/customauth";
import ReactJsonView from "react-json-view";
import { GOOGLE, verifierMap } from "../constants";

interface IState {
  loginDetails?: RedirectResult | null;
}

interface IProps {}

class RedirectAuth extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      loginDetails: null,
    };
  }

  async componentDidMount() {
    const { clientId } = verifierMap[GOOGLE];
    const torusdirectsdk = new CustomAuth({
      baseUrl: window.location.origin,
      redirectPathName: "auth",
      enableLogging: true,
      uxMode: "redirect",
      network: "testnet",
      web3AuthClientId: clientId,
    });
    const loginDetails = await torusdirectsdk.getRedirectResult();
    console.log(loginDetails);
    this.setState({
      loginDetails,
    });
  }

  render() {
    const { loginDetails } = this.state;
    return (
      <div className="App">
        <div className="about">
          <h1>This is the redirected page</h1>
          {loginDetails && <ReactJsonView src={loginDetails} style={{ textAlign: "left" }} />}
        </div>
      </div>
    );
  }
}

export default RedirectAuth;
