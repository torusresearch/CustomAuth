/* eslint-disable class-methods-use-this */
import React from "react";
import Link from "next/link";
import TorusSdk, { TorusLoginResponse } from "@toruslabs/customauth";
import dynamic from "next/dynamic";

import {
  verifierMap,
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
  COGNITO,
  COGNITO_AUTH_DOMAIN,
} from "../lib/constants";

let ReactJsonView;
if (typeof window === "object") {
  ReactJsonView = dynamic(() => import("react-json-view"));
}

interface IState {
  selectedVerifier: string;
  torusdirectsdk: TorusSdk | null;
  loginHint: string;
  loginResponse?: TorusLoginResponse | null;
}

interface IProps {}
class HomePage extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedVerifier: "",
      torusdirectsdk: null,
      loginHint: "",
      loginResponse: null,
    };
  }

  componentDidMount = async () => {
    try {
      /**
       * Important Note:
       * After user completes the oauth login process, user will be redirected to redirectPathName
       * which you will specify while initializing sdk. If you are using serviceworker or redirect.html
       * file provided in this package to handle the redirect result which parses the login result
       * and sends the result back to original window (i.e. where login was initiated).
       * But User might close original window before completing login process (in popup uxMode)
       * or only one window exists during login (in redirect mode), in that case
       * service worker will not able to send login result back to original window and it will
       * simply redirect to root path of app ('i.e': '/') with the login results in hash params
       * and search params.
       * So a best practice is to add a fallback handler in the root page of your app.
       * Here we are simply parsing hash params and search params to get the login results.
       * If you are using redirect uxMode (recommended) , you don't have to include this fallback handler
       * in your code.
       */
      const url = new URL(window.location.href);
      const hash = url.hash.substr(1);
      const queryParams = {} as Record<string, any>;
      for (const key of url.searchParams.keys()) {
        queryParams[key] = url.searchParams.get(key);
      }
      const { error, instanceParameters } = this.handleRedirectParameters(hash, queryParams);
      const torusdirectsdk = new TorusSdk({
        baseUrl: `${window.location.origin}/serviceworker`,
        enableLogging: true,
        network: "testnet", // details for test net
      });

      await torusdirectsdk.init({ skipSw: false });

      this.setState({ torusdirectsdk });

      if (hash) {
        if (error) throw new Error(error);
        const { verifier: returnedVerifier } = instanceParameters as Record<string, any>;
        const selectedVerifier = Object.keys(verifierMap).find((x) => verifierMap[x].verifier === returnedVerifier) as string;
        this.setState({
          selectedVerifier,
        });
        this._loginWithParams(hash, queryParams);
      }
    } catch (error) {
      console.error(error, "mounted caught");
    }
  };

  _loginWithParams = async (hash: string, queryParameters: Record<string, any>) => {
    const { selectedVerifier, torusdirectsdk } = this.state;
    console.log(hash, queryParameters);
    try {
      const jwtParams = this._loginToConnectionMap()[selectedVerifier] || {};
      const { typeOfLogin, clientId, verifier } = verifierMap[selectedVerifier];
      const loginDetails = await torusdirectsdk?.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
        hash,
        queryParameters,
      });
      this.setState({ loginResponse: loginDetails });
    } catch (error) {
      console.error(error, "login caught");
    }
  };

  handleRedirectParameters = (hash: string, queryParameters: Record<string, any>) => {
    const hashParameters = hash.split("&").reduce((result: Record<string, any>, item) => {
      const [part0, part1] = item.split("=");
      result[part0] = part1;
      return result;
    }, {});
    let instanceParameters = {};
    let error = "";
    if (!queryParameters.preopenInstanceId) {
      if (Object.keys(hashParameters).length > 0 && hashParameters.state) {
        instanceParameters = JSON.parse(atob(decodeURIComponent(decodeURIComponent(hashParameters.state)))) || {};
        error = hashParameters.error_description || hashParameters.error || error;
      } else if (Object.keys(queryParameters).length > 0 && queryParameters.state) {
        instanceParameters = JSON.parse(atob(decodeURIComponent(decodeURIComponent(queryParameters.state)))) || {};
        if (queryParameters.error) error = queryParameters.error;
      }
    }
    return { error, instanceParameters, hashParameters };
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
    };
  };

  render() {
    const { loginResponse } = this.state;
    return (
      <div className="app">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            margin: 100,
          }}
        >
          <Link href="/redirectMode/login">
            <button>Login with Redirect Mode (Recommended)</button>
          </Link>
          <Link href="/popupMode/login">
            <button>Login with Popup Mode</button>
          </Link>
        </div>

        {loginResponse && (
          <div>
            <h2>Login Response</h2>
            <ReactJsonView src={loginResponse} style={{ marginTop: 20 }} />
          </div>
        )}
      </div>
    );
  }
}

export default HomePage;
