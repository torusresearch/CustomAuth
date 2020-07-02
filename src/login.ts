import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";
import { keccak256 } from "web3-utils";

import createHandler from "./handlers/HandlerFactory";
import {
  AggregateLoginParams,
  DirectWebSDKArgs,
  ILoginHandler,
  InitParams,
  LoginWindowResponse,
  SubVerifierDetails,
  TorusAggregateLoginResponse,
  TorusKey,
  TorusLoginResponse,
  TorusVerifierResponse,
} from "./handlers/interfaces";
import { registerServiceWorker } from "./registerServiceWorker";
import { AGGREGATE_VERIFIER, ETHEREUM_NETWORK, LOGIN_TYPE } from "./utils/enums";
import { padUrlString } from "./utils/helpers";
import log from "./utils/loglevel";

class DirectWebSDK {
  isInitialized: boolean;

  config: {
    baseUrl: string;
    redirectToOpener: boolean;
    redirect_uri: string;
  };

  torus: Torus;

  nodeDetailManager: NodeDetailManager;

  constructor({
    baseUrl,
    network = ETHEREUM_NETWORK.MAINNET,
    proxyContractAddress = "0x638646503746d5456209e33a2ff5e3226d698bea",
    enableLogging = false,
    redirectToOpener = false,
    redirectPathName = "redirect",
  }: DirectWebSDKArgs) {
    this.isInitialized = false;
    const baseUri = new URL(baseUrl);
    this.config = {
      baseUrl: padUrlString(baseUri),
      get redirect_uri() {
        return `${this.baseUrl}${redirectPathName}`;
      },
      redirectToOpener,
    };
    const torus = new Torus();
    this.torus = torus;
    this.nodeDetailManager = new NodeDetailManager({ network, proxyAddress: proxyContractAddress });
    this.nodeDetailManager.getNodeDetails();
    if (enableLogging) log.enableAll();
    else log.disableAll();
  }

  async init({ skipSw = false }: InitParams = {}): Promise<void> {
    if (!skipSw) {
      const fetchSwResponse = await fetch(`${this.config.baseUrl}sw.js`, { cache: "reload" });
      if (fetchSwResponse.ok) {
        try {
          await registerServiceWorker(this.config.baseUrl);
          this.isInitialized = true;
          return;
        } catch (error) {
          log.error(error);
          await this.handleRedirectCheck();
        }
      } else {
        throw new Error("Service worker is not being served. Please serve it");
      }
    } else {
      await this.handleRedirectCheck();
    }
  }

  private async handleRedirectCheck(): Promise<void> {
    const response2 = await fetch(this.config.redirect_uri, { cache: "reload" });
    if (response2.ok) {
      this.isInitialized = true;
      return;
    }
    throw new Error(`Please serve redirect.html present in serviceworker folder of this package on ${this.config.redirect_uri}`);
  }

  async triggerLogin({ verifier, typeOfLogin, clientId, jwtParams }: SubVerifierDetails): Promise<TorusLoginResponse> {
    log.info("Verifier: ", verifier);
    if (!this.isInitialized) {
      throw new Error("Not initialized yet");
    }
    const loginHandler: ILoginHandler = createHandler({
      typeOfLogin,
      clientId,
      verifier,
      redirect_uri: this.config.redirect_uri,
      redirectToOpener: this.config.redirectToOpener,
      jwtParams,
    });
    const loginParams = await loginHandler.handleLoginWindow();
    const { accessToken, idToken } = loginParams;
    const userInfo = await loginHandler.getUserInfo(loginParams);
    const torusKey = await this.getTorusKey(verifier, userInfo.verifierId, { verifier_id: userInfo.verifierId }, idToken || accessToken);
    return {
      ...torusKey,
      userInfo: {
        ...userInfo,
        ...loginParams,
      },
    };
  }

  async triggerAggregateLogin({
    aggregateVerifierType,
    verifierIdentifier,
    subVerifierDetailsArray,
  }: AggregateLoginParams): Promise<TorusAggregateLoginResponse> {
    // This method shall break if any of the promises fail. This behaviour is intended
    if (!this.isInitialized) {
      throw new Error("Not initialized yet");
    }
    if (!aggregateVerifierType || !verifierIdentifier || !Array.isArray(subVerifierDetailsArray)) {
      throw new Error("Invalid params");
    }
    if (aggregateVerifierType === AGGREGATE_VERIFIER.SINGLE_VERIFIER_ID && subVerifierDetailsArray.length !== 1) {
      throw new Error("Single id verifier can only have one sub verifier");
    }
    const userInfoPromises: Promise<TorusVerifierResponse>[] = [];
    const loginParamsArray: LoginWindowResponse[] = [];
    for (const subVerifierDetail of subVerifierDetailsArray) {
      const { clientId, typeOfLogin, verifier, jwtParams } = subVerifierDetail;
      const loginHandler: ILoginHandler = createHandler({
        typeOfLogin,
        clientId,
        verifier,
        redirect_uri: this.config.redirect_uri,
        redirectToOpener: this.config.redirectToOpener,
        jwtParams,
      });
      // We let the user login to each verifier in a loop. Don't wait for key derivation here.!
      // eslint-disable-next-line no-await-in-loop
      const loginParams = await loginHandler.handleLoginWindow();
      // Fail the method even if one promise fails
      userInfoPromises.push(loginHandler.getUserInfo(loginParams));
      loginParamsArray.push(loginParams);
    }
    const userInfoArray = await Promise.all(userInfoPromises);
    const aggregateVerifierParams = { verify_params: [], sub_verifier_ids: [], verifier_id: "" };
    const aggregateIdTokenSeeds = [];
    let aggregateVerifierId = "";
    for (let index = 0; index < subVerifierDetailsArray.length; index += 1) {
      const loginParams = loginParamsArray[index];
      const { idToken, accessToken } = loginParams;
      const userInfo = userInfoArray[index];
      aggregateVerifierParams.verify_params.push({ verifier_id: userInfo.verifierId, idtoken: idToken || accessToken });
      aggregateVerifierParams.sub_verifier_ids.push(userInfo.verifier);
      aggregateIdTokenSeeds.push(idToken || accessToken);
      aggregateVerifierId = userInfo.verifierId; // using last because idk
    }
    aggregateIdTokenSeeds.sort();
    const aggregateIdToken = keccak256(aggregateIdTokenSeeds.join(String.fromCharCode(29))).slice(2);
    aggregateVerifierParams.verifier_id = aggregateVerifierId;
    const torusKey = await this.getTorusKey(verifierIdentifier, aggregateVerifierId, aggregateVerifierParams, aggregateIdToken);
    return {
      ...torusKey,
      userInfo: userInfoArray.map((x, index) => {
        return { ...x, ...loginParamsArray[index] };
      }),
    };
  }

  async getTorusKey(verifier: string, verifierId: string, verifierParams: { verifier_id: string }, idToken: string): Promise<TorusKey> {
    const { torusNodeEndpoints, torusNodePub, torusIndexes } = await this.nodeDetailManager.getNodeDetails();
    const response = await this.torus.getPublicAddress(torusNodeEndpoints, torusNodePub, { verifier: verifier as LOGIN_TYPE, verifierId }, false);
    log.info("New private key assigned to user at address ", response);
    const data = await this.torus.retrieveShares(torusNodeEndpoints, torusIndexes, verifier as LOGIN_TYPE, verifierParams, idToken);
    if (data.ethAddress.toLowerCase() !== response.toString().toLowerCase()) throw new Error("Invalid");
    log.info(data);
    return { publicAddress: data.ethAddress.toString(), privateKey: data.privKey.toString() };
  }
}

export default DirectWebSDK;
