/**
 * User will be redirected to this page in redirect uxMode
 */
import React from "react";
import { KEY_TYPE } from "@toruslabs/constants";
import { CustomAuth } from "@toruslabs/customauth";
import { fetchLocalConfig } from "@toruslabs/fnd-base";
import dynamic from "next/dynamic";

import { DEFAULT_NETWORK, getVerifierMap, GOOGLE } from "../lib/constants";

let ReactJsonView;
if (typeof window === "object") {
  ReactJsonView = dynamic(() => import("@uiw/react-json-view"));
}

interface IState {
  loginDetails?: unknown | null;
}

interface IProps {}

class RedirectAuth extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      loginDetails: null,
    };
  }

  getWeb3AuthClientIdFromUrl = (): string => {
    const verifierMap = getVerifierMap(DEFAULT_NETWORK);
    const verifierToClientId = Object.values(verifierMap).reduce<Record<string, string>>((acc, item) => {
      acc[item.verifier] = item.clientId;
      return acc;
    }, {});
    const fallbackClientId = verifierMap[GOOGLE].clientId;

    try {
      const url = new URL(window.location.href);
      const hash = url.hash.replace(/^#/, "");
      const searchState = url.searchParams.get("state");
      const stateFromHash = hash
        .split("&")
        .find((part) => part.startsWith("state="))
        ?.split("=")[1];
      const encodedState = stateFromHash || searchState;
      if (!encodedState) return fallbackClientId;

      const decodedState = decodeURIComponent(decodeURIComponent(encodedState));
      const parsed = JSON.parse(atob(decodedState)) as { verifier?: string };
      if (!parsed.verifier) return fallbackClientId;
      return verifierToClientId[parsed.verifier] || fallbackClientId;
    } catch {
      return fallbackClientId;
    }
  };

  async componentDidMount() {
    const nodeDetails = fetchLocalConfig(DEFAULT_NETWORK, KEY_TYPE.SECP256K1);
    const web3AuthClientId = this.getWeb3AuthClientIdFromUrl();
    const torusdirectsdk = new CustomAuth({
      baseUrl: window.location.origin,
      redirectPathName: "auth",
      enableLogging: true,
      uxMode: "redirect",
      network: DEFAULT_NETWORK,
      web3AuthClientId,
      nodeDetails,
      checkCommitment: false,
    });
    const loginDetails = await torusdirectsdk.getRedirectResult();
    const response = ((loginDetails as any)?.result || loginDetails) as any;
    const localPrivKey = response?.finalKeyData?.privKey || response?.oAuthKeyData?.privKey;
    if (localPrivKey) {
      localStorage.setItem("privKey", localPrivKey);
    }
    if (response?.userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(response.userInfo));
    }
    this.setState({
      loginDetails,
    });
    if (localPrivKey) {
      window.location.replace("/");
    }
  }

  render() {
    const { loginDetails } = this.state;
    return (
      <div className="App">
        <div className="about">
          <h1>This is the redirected page</h1>
          {loginDetails && <ReactJsonView value={loginDetails} style={{ textAlign: "left" }} />}
        </div>
      </div>
    );
  }
}

export default RedirectAuth;
