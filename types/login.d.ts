/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";

import {
  AggregateLoginParams,
  DirectWebSDKArgs,
  InitParams,
  SubVerifierDetails,
  TorusAggregateLoginResponse,
  TorusKey,
  TorusLoginResponse,
} from "./helpers";

declare class DirectWebSDK {
  torus: Torus;

  nodeDetailManager: NodeDetailManager;

  constructor({ baseUrl, network, proxyContractAddress, enableLogging, redirectToOpener }: DirectWebSDKArgs);

  init({ skipSw }: InitParams): Promise<void>;

  triggerLogin({ typeOfLogin, verifier, clientId, jwtParams }: SubVerifierDetails): Promise<TorusLoginResponse>;

  triggerAggregateLogin({
    aggregateVerifierType,
    verifierIdentifier,
    subVerifierDetailsArray,
  }: AggregateLoginParams): Promise<TorusAggregateLoginResponse>;

  getTorusKey(
    verifier: string,
    verifierId: string,
    verifierParams: {
      verifier_id: string;
    },
    idToken: string
  ): Promise<TorusKey>;
}

// eslint-disable-next-line no-undef
export as namespace DirectWebSdk;

export = DirectWebSDK;
