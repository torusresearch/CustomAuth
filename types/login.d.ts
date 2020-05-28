import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";

declare class DirectWebSDK {
  torus: Torus;

  nodeDetailManager: NodeDetailManager;

  constructor({ baseUrl, network, proxyContractAddress, enableLogging, redirectToOpener }: DirectWebSDKArgs);

  init(): Promise<void>;

  triggerLogin(typeOfLogin: LOGIN_TYPE, verifier: string, clientId: string): Promise<TorusLoginResponse>;

  handleLogin(
    verifier: string,
    verifierId: string,
    verifierParams: {
      verifier_id: string;
    },
    idToken: string
  ): Promise<TorusKey>;
}

export as namespace DirectWebSdk;

export = DirectWebSDK;

type NETWORK_TYPE = ETHEREUM_NETWORK.MAINNET | ETHEREUM_NETWORK.RINKEBY | ETHEREUM_NETWORK.ROPSTEN | ETHEREUM_NETWORK.KOVAN | ETHEREUM_NETWORK.GOERLI;
interface TorusVerifierResponse {
  email: string;
  name: string;
  profileImage: string;
  verifier: string;
  verifierId: string;
}
interface LoginWindowResponse {
  accessToken: string;
  idToken?: string;
}
interface ILoginHandler {
  clientId: string;
  getUserInfo(accessToken: string): Promise<TorusVerifierResponse>;
  handleLoginWindow(): Promise<LoginWindowResponse>;
}
interface TorusKey {
  publicAddress: string;
  privateKey: string;
}
type TorusLoginResponse = TorusVerifierResponse & TorusKey;

interface DirectWebSDKArgs {
  baseUrl: string;
  network?: NETWORK_TYPE | string;
  proxyContractAddress?: string;
  enableLogging?: boolean;
  redirectToOpener?: boolean;
}

declare enum ETHEREUM_NETWORK {
  ROPSTEN = "ropsten",
  RINKEBY = "rinkeby",
  KOVAN = "kovan",
  MAINNET = "mainnet",
  GOERLI = "goerli",
}

declare enum LOGIN_TYPE {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  REDDIT = "reddit",
  DISCORD = "discord",
  TWITCH = "twitch",
}
