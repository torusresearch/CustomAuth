import React from "react";
import "../App.css";
import TorusSdk, { TorusLoginResponse } from "@toruslabs/customauth";

import { getStarkHDAccount, starkEc, sign, verify, pedersen, STARKNET_NETWORKS } from "@toruslabs/openlogin-starkkey";
import { binaryToHex, binaryToUtf8, bufferToBinary, bufferToHex, hexToBinary } from "enc-utils";
import type { ec } from "elliptic";

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
} from "../constants";

interface IState {
  selectedVerifier: string;
  torusdirectsdk: TorusSdk | null;
  loginResponse?: TorusLoginResponse | null;
  signingMessage?: string | null;
  signedMessage?: ec.Signature | null;
}

interface IProps {}

class PopupMode extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedVerifier: GOOGLE,
      torusdirectsdk: null,
      loginResponse: null,
      signingMessage: null,
      signedMessage: null,
    };
  }

  componentDidMount = async () => {
    try {
      const torusdirectsdk = new TorusSdk({
        baseUrl: `${window.location.origin}/serviceworker`,
        enableLogging: true,
        network: "testnet", // details for test net
      });

      await torusdirectsdk.init({ skipSw: false });

      this.setState({ torusdirectsdk });
    } catch (error) {
      console.error(error, "mounted caught");
    }
  };

  login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { selectedVerifier, torusdirectsdk } = this.state;
    // console.log(hash, queryParameters);
    try {
      const jwtParams = this._loginToConnectionMap()[selectedVerifier] || {};
      const { typeOfLogin, clientId, verifier } = verifierMap[selectedVerifier];
      const loginDetails = await torusdirectsdk?.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
      });
      this.setState({ loginResponse: loginDetails });
      this.printToConsole(loginDetails);
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

  printToConsole = (...args: unknown[]): void => {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  };

  getStarkAccount = (index: number): { pubKey: string; privKey: string } => {
    const account = getStarkHDAccount((this.state.loginResponse?.privateKey as string).padStart(64, "0"), index, STARKNET_NETWORKS.testnet);
    return account;
  };

  starkHdAccount = (e: any): { pubKey?: string; privKey?: string } => {
    e.preventDefault();
    const accIndex = e.target[0].value;
    const account = this.getStarkAccount(accIndex);
    this.printToConsole({
      ...account,
    });
    return account;
  };

  /**
   *
   * @param str utf 8 string to be signed
   * @param prefix hex prefix padded to 252 bits (optional)
   * @returns
   */
  getPedersenHashRecursively = (str: string, prefix?: string): string => {
    const TEST_MESSAGE_SUFFIX = prefix || "TORUS STARKWARE-";
    const x = Buffer.from(str, "utf8");
    const binaryStr = hexToBinary(bufferToHex(x));
    const rounds = Math.ceil(binaryStr.length / 252);
    if (rounds > 1) {
      const currentChunkHex = binaryToHex(binaryStr.substring(0, 252));
      if (prefix) {
        const hash = pedersen([prefix, currentChunkHex]);
        const pendingStr = binaryToUtf8(binaryStr.substring(252));
        return this.getPedersenHashRecursively(pendingStr.replace("\n", ""), hash);
      }
      // send again with default prefix,
      // this prefix is only relevant for this example and
      // has no relevance with starkware message encoding.
      return this.getPedersenHashRecursively(str, binaryToHex(bufferToBinary(Buffer.from(TEST_MESSAGE_SUFFIX, "utf8")).padEnd(252, "0")));
    }
    const currentChunkHex = binaryToHex(binaryStr.padEnd(252, "0"));
    return pedersen([prefix, currentChunkHex]);
  };

  signMessageWithStarkKey = (e: any) => {
    e.preventDefault();
    const accIndex = e.target[0].value;
    const message = e.target[1].value;
    const account = this.getStarkAccount(accIndex);
    const keyPair = starkEc.keyFromPrivate(account.privKey);
    const hash = this.getPedersenHashRecursively(message);
    const signedMessage = sign(keyPair, hash);
    this.setState({ signingMessage: message, signedMessage: signedMessage as unknown as ec.Signature });
    this.printToConsole({
      pedersenHash: hash,
      info: `Message signed successfully: TORUS STARKWARE- ${message}`,
      signedMesssage: signedMessage,
    });
  };

  validateStarkMessage = (e: any) => {
    e.preventDefault();
    const signingAccountIndex = e.target[0].value;
    const account = this.getStarkAccount(signingAccountIndex);
    const keyPair = starkEc.keyFromPublic(account.pubKey, "hex");
    const hash = this.getPedersenHashRecursively(this.state.signingMessage as string);
    const isVerified = verify(keyPair, hash, this.state.signedMessage as unknown as ec.Signature);
    this.printToConsole(`Message is verified: ${isVerified}`);
  };

  render() {
    const { selectedVerifier, loginResponse } = this.state;
    return (
      <div className="App">
        {!loginResponse && (
          <>
            <div id="app" style={{ margin: 20 }}>
              <p>
                Please note that the verifiers listed in the example have <br />
                http://localhost:3000/serviceworker/redirect configured as the redirect uri.
              </p>
              <p>If you use any other domains, they won't work.</p>
              <p>The verifiers listed here are for example reference only. Please don't use them for anything other than testing purposes.</p>
              <div>
                Reach out to us at <a href="mailto:hello@tor.us">hello@tor.us</a> or <a href="https://t.me/torusdev">telegram group</a> to get your
                verifier deployed for your client id.
              </div>
            </div>
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
          </>
        )}
        {loginResponse && (
          <div>
            <span>Custom Auth Private key: {loginResponse.privateKey}</span>
            <h2>Enter HD account index to derive stark key pair from custom auth's private key</h2>
            <form onSubmit={this.starkHdAccount}>
              <input placeholder="Enter hd account index" id="accountIndex" type="number" required />
              <button type="submit">Get Stark Key Pair </button>
            </form>
            <br />
            <br />
            <form
              onSubmit={this.signMessageWithStarkKey}
              style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
            >
              <input id="accountIndex" type="number" placeholder="Enter hd account index" required />
              <input id="message" type="textarea" placeholder="Enter message" required />
              <button type="submit">Sign Message with StarkKey </button>
            </form>
            <br />
            <br />
            <form
              onSubmit={this.validateStarkMessage}
              style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
            >
              <input id="accountIndex" type="number" placeholder="Enter account index" required />
              <button type="submit" disabled={!this.state.signingMessage}>
                Validate Stark Message
              </button>
            </form>
            <div id="console" style={{ whiteSpace: "pre-line", height: 300 }}>
              <p style={{ whiteSpace: "pre-line" }} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default PopupMode;
