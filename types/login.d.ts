/* eslint-disable import/no-unresolved */
import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";

// eslint-disable-next-line import/extensions
import { AGGREGATE_VERIFIER_TYPE, DirectWebSDKArgs, SubVerifierDetails, TorusAggregateLoginResponse, TorusKey, TorusLoginResponse } from "./helpers";

declare class DirectWebSDK {
  torus: Torus;

  nodeDetailManager: NodeDetailManager;

  constructor({ baseUrl, network, proxyContractAddress, enableLogging, redirectToOpener }: DirectWebSDKArgs);

  init(): Promise<void>;

  triggerLogin({ typeOfLogin, verifier, clientId, jwtParams }: SubVerifierDetails): Promise<TorusLoginResponse>;

  triggerAggregateLogin(
    aggregateVerifierType: AGGREGATE_VERIFIER_TYPE,
    verifierIdentifier: string,
    subVerifierDetailsArray: SubVerifierDetails[]
  ): Promise<TorusAggregateLoginResponse>;

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
