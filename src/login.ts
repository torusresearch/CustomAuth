import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";

import { DirectWebSDKArgs, ILoginHandler, TorusKey, TorusLoginResponse } from "./handlers/interfaces";
import { registerServiceWorker } from "./registerServiceWorker";
import { ETHEREUM_NETWORK, LOGIN_TYPE } from "./utils/enums";
import { createHandler } from "./utils/helpers";
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
  }: DirectWebSDKArgs) {
    this.isInitialized = false;
    const baseUri = new URL(baseUrl);
    this.config = {
      baseUrl: baseUri.href.endsWith("/") ? baseUri.href : `${baseUri.href}/`,
      get redirect_uri() {
        return `${this.baseUrl}redirect`;
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

  async init(): Promise<void> {
    const fetchSwResponse = await fetch(`${this.config.baseUrl}sw.js`, { cache: "reload" });
    if (fetchSwResponse.ok) {
      try {
        await registerServiceWorker(this.config.baseUrl);
        this.isInitialized = true;
        return;
      } catch (error) {
        log.error(error);
        const response2 = await fetch(this.config.redirect_uri, { cache: "reload" });
        if (response2.ok) {
          this.isInitialized = true;
          return;
        }
        throw new Error(
          `Service worker not supported. Please serve redirect.html present in public folder of this package on ${this.config.redirect_uri}`
        );
      }
    } else {
      throw new Error("Service worker is not being served. Checking for fallback");
    }
  }

  async triggerLogin(typeOfLogin: LOGIN_TYPE, verifier: string, clientId: string): Promise<TorusLoginResponse> {
    log.info("Verifier: ", verifier);
    if (!this.isInitialized) {
      throw new Error("Not initialized yet");
    }
    if (!verifier || !typeOfLogin) {
      throw new Error("Invalid params");
    }
    if (!clientId) {
      throw new Error("Client id is not available");
    }
    const loginHandler: ILoginHandler = createHandler(typeOfLogin, clientId, verifier, this.config.redirect_uri, this.config.redirectToOpener);
    const loginParams = await loginHandler.handleLoginWindow();
    const userInfo = await loginHandler.getUserInfo(loginParams.accessToken);
    const torusKey = await this.handleLogin(
      verifier,
      userInfo.verifierId,
      { verifier_id: userInfo.verifierId },
      loginParams.idToken || loginParams.accessToken
    );
    return {
      ...torusKey,
      ...userInfo,
    };
  }

  async handleLogin(verifier: string, verifierId: string, verifierParams: { verifier_id: string }, idToken: string): Promise<TorusKey> {
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
