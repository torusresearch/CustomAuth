import { ETHEREUM_NETWORK, LOGIN_TYPE } from "../utils/enums";

type NETWORK_TYPE = ETHEREUM_NETWORK.MAINNET | ETHEREUM_NETWORK.RINKEBY | ETHEREUM_NETWORK.ROPSTEN | ETHEREUM_NETWORK.KOVAN | ETHEREUM_NETWORK.GOERLI;

// @flow
export interface TorusVerifierResponse {
  email: string;
  name: string;
  profileImage: string;
  verifier: string;
  verifierId: string;
}
export interface LoginWindowResponse {
  accessToken: string;
  idToken?: string;
}

// @flow
export interface ILoginHandler {
  clientId: string;
  getUserInfo(accessToken: string): Promise<TorusVerifierResponse>;
  handleLoginWindow(): Promise<LoginWindowResponse>;
}

// @flow
export interface TorusKey {
  publicAddress: string;
  privateKey: string;
}

export interface TorusAggregateVerifierResponse {
  userInfo: TorusVerifierResponse[];
}

export interface TorusSingleVerifierResponse {
  userInfo: TorusVerifierResponse;
}

export type TorusLoginResponse = TorusSingleVerifierResponse & TorusKey;
export type TorusAggregateLoginResponse = TorusAggregateVerifierResponse & TorusKey;

export interface DirectWebSDKArgs {
  baseUrl: string;
  network?: NETWORK_TYPE | string;
  proxyContractAddress?: string;
  enableLogging?: boolean;
  redirectToOpener?: boolean;
}

export interface SubVerifierDetails {
  typeOfLogin: LOGIN_TYPE;
  verifier: string;
  clientId: string;
}
