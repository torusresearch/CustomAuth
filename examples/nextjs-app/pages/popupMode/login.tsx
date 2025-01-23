import React from "react";
import { CustomAuth } from "@guru_test/customauth";
import dynamic from "next/dynamic";
import {
  verifierMap,
  GOOGLE,
  GITHUB,
  TWITTER,
  APPLE,
  AUTH_DOMAIN,
  EMAIL_PASSWORD,
  HOSTED_EMAIL_PASSWORDLESS,
  HOSTED_SMS_PASSWORDLESS,
  LINE,
  LINKEDIN,
  WEIBO,
  COGNITO_AUTH_DOMAIN,
  COGNITO,
  REDDIT,
  TELEGRAM,
} from "../../lib/constants";

let ReactJsonView;
if (typeof window === "object") {
  ReactJsonView = dynamic(() => import("@uiw/react-json-view"));
}

interface IState {
  selectedVerifier: string;
  torusdirectsdk: any | null;
  loginHint: string;
  loginDetails?: any | null;
}

interface IProps {}
class MyApp extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      selectedVerifier: GOOGLE,
      torusdirectsdk: null as any | null,
      loginHint: "",
      loginDetails: null,
    };
  }

  componentDidMount = async () => {
    try {
      const torusdirectsdk = new CustomAuth({
        baseUrl: `${window.location.origin}/serviceworker`,
        enableLogging: true,
        network: "sapphire_devnet",
        web3AuthClientId: "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ",
      });

      await torusdirectsdk.init({ skipSw: false });

      this.setState({ torusdirectsdk });
    } catch (error) {
      console.error(error, "mounted caught");
    }
  };

  login = async (e) => {
    e.preventDefault();
    const { selectedVerifier, torusdirectsdk } = this.state;

    try {
      const jwtParams = this._loginToConnectionMap()[selectedVerifier] || {};
      const { typeOfLogin, clientId, verifier } = verifierMap[selectedVerifier];
      const loginDetails = await torusdirectsdk.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
      });
      console.log(loginDetails);
      this.setState({
        loginDetails,
      });
    } catch (error) {
      console.error(error, "login caught");
    }
  };

  _loginToConnectionMap = () => {
    return {
      [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },
      [HOSTED_EMAIL_PASSWORDLESS]: {
        domain: AUTH_DOMAIN,
        verifierIdField: "name",
        connection: "",
        isVerifierIdCaseSensitive: false,
      },
      [HOSTED_SMS_PASSWORDLESS]: {
        domain: AUTH_DOMAIN,
        verifierIdField: "name",
        connection: "",
      },
      [APPLE]: { domain: AUTH_DOMAIN },
      [GITHUB]: { domain: AUTH_DOMAIN },
      [LINKEDIN]: { domain: AUTH_DOMAIN },
      [TWITTER]: { domain: AUTH_DOMAIN },
      [WEIBO]: { domain: AUTH_DOMAIN },
      [LINE]: { domain: AUTH_DOMAIN },
      [COGNITO]: { domain: COGNITO_AUTH_DOMAIN, identity_provider: "Google", response_type: "token", user_info_endpoint: "userInfo" },
      [TELEGRAM]: {
        domain: AUTH_DOMAIN,
        identity_provider: "Telegram",
        origin: "https://custom-auth-beta.vercel.app/serviceworker/redirect",
      },
      [REDDIT]: { domain: AUTH_DOMAIN, connection: "Reddit", verifierIdField: "name", isVerifierIdCaseSensitive: false },
    };
  };

  render() {
    const { selectedVerifier, loginDetails } = this.state;

    return (
      <div className="App">
        <form onSubmit={this.login}>
          <div>
            <span style={{ marginRight: "10px" }}>Verifier:</span>
            <select value={selectedVerifier} onChange={(e) => this.setState({ selectedVerifier: e.target.value })}>
              {Object.keys(verifierMap).map((login) => (
                <option value={login} key={login.toString()}>
                  {verifierMap[login].name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: "20px" }}>
            <button>Login with Torus</button>
          </div>
        </form>
        <div id="app">
          <p>
            Please note that the verifiers listed in the example have http://localhost:3000/serviceworker/redirect configured as the redirect uri.
          </p>
          <p>If you use any other domains, they won't work.</p>
          <p>The verifiers listed here only work with the client id's specified in example. Please don't edit them</p>
          <p>The verifiers listed here are for example reference only. Please don't use them for anything other than testing purposes.</p>
          <div>
            Reach out to us at <a href="mailto:hello@tor.us">hello@tor.us</a> or <a href="https://t.me/torusdev">telegram group</a> to get your
            verifier deployed for your client id.
          </div>
        </div>
        {loginDetails && (
          <div>
            <h2>Login Response</h2>
            <ReactJsonView value={loginDetails} style={{ marginTop: 20, textAlign: "left" }} />
          </div>
        )}
      </div>
    );
  }
}

export default MyApp;
