/**
 * User will be redirected to this page in redirect uxMode
 */
import React from "react";
import { CustomAuth, RedirectResult } from "@toruslabs/customauth";
import dynamic from "next/dynamic";

let ReactJsonView;
if (typeof window === "object") {
  ReactJsonView = dynamic(() => import("react-json-view"));
}

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
    const torusdirectsdk = new CustomAuth({
      baseUrl: window.location.origin,
      redirectPathName: "auth",
      enableLogging: true,
      uxMode: "redirect",
      network: "sapphire_devnet",
      web3AuthClientId: "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ",
    });
    const loginDetails = await torusdirectsdk.getRedirectResult();
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
