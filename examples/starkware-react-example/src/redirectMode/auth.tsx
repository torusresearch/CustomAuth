import React from "react";
import "../App.css";
import TorusSdk, { RedirectResult } from "@toruslabs/customauth";
import { getStarkHDAccount, starkEc, sign, verify, pedersen, STARKNET_NETWORKS } from "@toruslabs/openlogin-starkkey";
import { binaryToHex, binaryToUtf8, bufferToBinary, bufferToHex, hexToBinary } from "enc-utils";
import type { ec } from "elliptic";

interface IState {
  loginDetails?: RedirectResult | null;
  signingMessage?: string | null;
  signedMessage?: ec.Signature | null;
}

interface IProps {}

class RedirectAuth extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      loginDetails: null,
      signingMessage: null,
      signedMessage: null,
    };
  }

  async componentDidMount() {
    const torusdirectsdk = new TorusSdk({
      baseUrl: window.location.origin,
      redirectPathName: "auth",
      enableLogging: true,
      uxMode: "redirect",
      network: "testnet",
    });
    const loginDetails = await torusdirectsdk.getRedirectResult();
    console.log(loginDetails);
    this.setState({
      loginDetails,
    });
    this.printToConsole(loginDetails);
  }

  printToConsole = (...args: unknown[]): void => {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  };

  getStarkAccount = (index: number): { pubKey: string; privKey: string } => {
    const account = getStarkHDAccount(
      ((this.state.loginDetails?.result as any)?.privateKey as string).padStart(64, "0"),
      index,
      STARKNET_NETWORKS.testnet
    );
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
    const { loginDetails } = this.state;
    return (
      <div className="App">
        <div className="about">
          <h3>This is the redirected page</h3>
        </div>
        {(loginDetails?.result as any)?.privateKey && (
          <div>
            <span>Custom Auth Private key: {(loginDetails?.result as any)?.privateKey}</span>
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
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", padding: 20 }}>
          <div id="console" style={{ whiteSpace: "pre-line", height: 300 }}>
            <p style={{ whiteSpace: "pre-line" }} />
          </div>
        </div>
      </div>
    );
  }
}

export default RedirectAuth;
