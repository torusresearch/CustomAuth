import React from "react";
import TorusSdk, { UX_MODE } from "@toruslabs/customauth";

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
} from "../../lib/constants";

interface IState {
  selectedVerifier: string;
  torusdirectsdk: TorusSdk | null;
  loginHint: string;
  consoleText?: string;
}

interface IProps {}

class RedirectMode extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedVerifier: GOOGLE,
      torusdirectsdk: null,
      loginHint: "",
    };
  }

  componentDidMount = async () => {
    try {
      const torusdirectsdk = new TorusSdk({
        baseUrl: window.location.origin,
        // user will be redirect to auth page after login
        redirectPathName: "auth",
        enableLogging: true,
        uxMode: UX_MODE.REDIRECT,
        network: "testnet",
      });
      await torusdirectsdk.init({ skipSw: true });

      this.setState({ torusdirectsdk });
    } catch (error) {
      console.error(error, "mounted caught");
    }
  };

  login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { selectedVerifier, torusdirectsdk } = this.state;

    try {
      const jwtParams = this._loginToConnectionMap()[selectedVerifier] || {};
      const { typeOfLogin, clientId, verifier } = verifierMap[selectedVerifier];
      // in redirect mode, login result will be handled in redirect page
      // (Check auth.tsx file)
      await torusdirectsdk?.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
      });
    } catch (error) {
      console.error(error, "login caught");
    }
  };

  _loginToConnectionMap = (): Record<string, any> => {
    return {
      [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },
      [HOSTED_EMAIL_PASSWORDLESS]: {
        domain: AUTH_DOMAIN,
        verifierIdField: "name",
        connection: "",
        isVerifierIdCaseSensitive: false,
      },
      [HOSTED_SMS_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "" },
      [APPLE]: { domain: AUTH_DOMAIN },
      [GITHUB]: { domain: AUTH_DOMAIN },
      [LINKEDIN]: { domain: AUTH_DOMAIN },
      [TWITTER]: { domain: AUTH_DOMAIN },
      [WEIBO]: { domain: AUTH_DOMAIN },
      [LINE]: { domain: AUTH_DOMAIN },
      [COGNITO]: { domain: COGNITO_AUTH_DOMAIN, identity_provider: "Google", response_type: "token", user_info_endpoint: "userInfo" },
      [REDDIT]: { domain: AUTH_DOMAIN, connection: "Reddit", verifierIdField: "name", isVerifierIdCaseSensitive: false },
    };
  };

  render() {
    const { selectedVerifier } = this.state;

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
            Please note that the verifiers listed in the example have <br />
            http://localhost:3000/serviceworker/redirect configured as the redirect uri.
          </p>
          <p>If you use any other domains, they won't work.</p>
          <p>The verifiers listed here only work with the client id's specified in example. Please don't edit them</p>
          <p>The verifiers listed here are for example reference only. Please don't use them for anything other than testing purposes.</p>
          <div>
            Reach out to us at <a href="mailto:hello@tor.us">hello@tor.us</a> or <a href="https://t.me/torusdev">telegram group</a> to get your
            verifier deployed for your client id.
          </div>
          <div id="console">
            <p />
          </div>
        </div>
      </div>
    );
  }
}

export default RedirectMode;
