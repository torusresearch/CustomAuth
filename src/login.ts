import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";
import { keccak256 } from "web3-utils";

import createHandler from "./handlers/HandlerFactory";
import {
  AggregateLoginParams,
  DirectWebSDKArgs,
  extraParams,
  HybridAggregateLoginParams,
  ILoginHandler,
  InitParams,
  LoginWindowResponse,
  RedirectResult,
  RedirectResultParams,
  SubVerifierDetails,
  TorusAggregateLoginResponse,
  TorusHybridAggregateLoginResponse,
  TorusKey,
  TorusLoginResponse,
  TorusSubVerifierInfo,
  TorusVerifierResponse,
} from "./handlers/interfaces";
import { registerServiceWorker } from "./registerServiceWorker";
import {
  AGGREGATE_VERIFIER,
  CONTRACT_MAP,
  ETHEREUM_NETWORK,
  LOGIN,
  REDIRECT_PARAMS_STORAGE_METHOD,
  REDIRECT_PARAMS_STORAGE_METHOD_TYPE,
  TORUS_METHOD,
  TORUS_NETWORK,
  UX_MODE,
  UX_MODE_TYPE,
} from "./utils/enums";
import {
  clearLoginDetailsStorage,
  clearOrphanedLoginDetails,
  handleRedirectParameters,
  isFirefox,
  padUrlString,
  retrieveLoginDetails,
  storeLoginDetails,
} from "./utils/helpers";
import log from "./utils/loglevel";

class DirectWebSDK {
  isInitialized: boolean;

  config: {
    baseUrl: string;
    redirectToOpener: boolean;
    redirect_uri: string;
    uxMode: UX_MODE_TYPE;
    redirectParamsStorageMethod: REDIRECT_PARAMS_STORAGE_METHOD_TYPE;
    locationReplaceOnRedirect: boolean;
    popupFeatures: string;
  };

  torus: Torus;

  nodeDetailManager: NodeDetailManager;

  constructor({
    baseUrl,
    network = TORUS_NETWORK.MAINNET,
    proxyContractAddress,
    enableLogging = false,
    redirectToOpener = false,
    redirectPathName = "redirect",
    apiKey = "torus-default",
    uxMode = UX_MODE.POPUP,
    redirectParamsStorageMethod = REDIRECT_PARAMS_STORAGE_METHOD.SESSION_STORAGE,
    locationReplaceOnRedirect = false,
    popupFeatures,
    skipFetchingNodeDetails = false,
  }: DirectWebSDKArgs) {
    this.isInitialized = false;
    const baseUri = new URL(baseUrl);
    this.config = {
      baseUrl: padUrlString(baseUri),
      get redirect_uri() {
        return `${this.baseUrl}${redirectPathName}`;
      },
      redirectToOpener,
      uxMode,
      redirectParamsStorageMethod,
      locationReplaceOnRedirect,
      popupFeatures,
    };
    const torus = new Torus({
      enableLogging,
      metadataHost: "https://metadata.tor.us",
      allowHost: "https://signer.tor.us/api/allow",
    });
    Torus.setAPIKey(apiKey);
    this.torus = torus;
    const ethNetwork = network === TORUS_NETWORK.TESTNET ? ETHEREUM_NETWORK.ROPSTEN : network;
    this.nodeDetailManager = new NodeDetailManager({ network: ethNetwork, proxyAddress: proxyContractAddress || CONTRACT_MAP[network] });
    if (!skipFetchingNodeDetails) this.nodeDetailManager.getNodeDetails();
    if (enableLogging) log.enableAll();
    else log.disableAll();
  }

  async init({ skipSw = false, skipInit = false, skipPrefetch = false }: InitParams = {}): Promise<void> {
    if (skipInit) {
      this.isInitialized = true;
      return;
    }
    if (!skipSw) {
      const fetchSwResponse = await fetch(`${this.config.baseUrl}sw.js`, { cache: "reload" });
      if (fetchSwResponse.ok) {
        try {
          await registerServiceWorker(this.config.baseUrl);
          this.isInitialized = true;
          return;
        } catch (error) {
          log.warn(error);
        }
      } else {
        throw new Error("Service worker is not being served. Please serve it");
      }
    }
    if (!skipPrefetch) {
      // Skip the redirect check for firefox
      if (isFirefox()) {
        this.isInitialized = true;
        return;
      }
      await this.handlePrefetchRedirectUri();
      return;
    }
    this.isInitialized = true;
  }

  private async handlePrefetchRedirectUri(): Promise<void> {
    if (!document) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const redirectHtml = document.createElement("link");
      redirectHtml.href = this.config.redirect_uri;
      if (window.location.origin !== new URL(this.config.redirect_uri).origin) redirectHtml.crossOrigin = "anonymous";
      redirectHtml.type = "text/html";
      redirectHtml.rel = "prefetch";
      const resolveFn = () => {
        this.isInitialized = true;
        resolve();
      };
      try {
        if (redirectHtml.relList && redirectHtml.relList.supports) {
          if (redirectHtml.relList.supports("prefetch")) {
            redirectHtml.onload = resolveFn;
            redirectHtml.onerror = () => {
              reject(new Error(`Please serve redirect.html present in serviceworker folder of this package on ${this.config.redirect_uri}`));
            };
            document.head.appendChild(redirectHtml);
          } else {
            // Link prefetch is not supported. pass through
            resolveFn();
          }
        } else {
          // Link prefetch is not detectable. pass through
          resolveFn();
        }
      } catch (err) {
        resolveFn();
      }
    });
  }

  async triggerLogin(args: SubVerifierDetails & { registerOnly?: boolean }): Promise<TorusLoginResponse> {
    const { verifier, typeOfLogin, clientId, jwtParams, hash, queryParameters, customState, registerOnly } = args;
    log.info("Verifier: ", verifier);
    if (!this.isInitialized) {
      throw new Error("Not initialized yet");
    }
    if (registerOnly && typeOfLogin !== LOGIN.WEBAUTHN) throw new Error("registerOnly flag can only be passed for webauthn");
    const loginHandler: ILoginHandler = createHandler({
      typeOfLogin,
      clientId,
      verifier,
      redirect_uri: this.config.redirect_uri,
      redirectToOpener: this.config.redirectToOpener,
      jwtParams,
      uxMode: this.config.uxMode,
      customState,
      registerOnly,
    });
    let loginParams: LoginWindowResponse;
    if (hash && queryParameters) {
      const { error, hashParameters, instanceParameters } = handleRedirectParameters(hash, queryParameters);
      if (error) throw new Error(error);
      const { access_token: accessToken, id_token: idToken, ...rest } = hashParameters;
      // State has to be last here otherwise it will be overwritten
      loginParams = { accessToken, idToken, ...rest, state: instanceParameters };
    } else {
      clearOrphanedLoginDetails(this.config.redirectParamsStorageMethod);
      storeLoginDetails({ method: TORUS_METHOD.TRIGGER_LOGIN, args }, this.config.redirectParamsStorageMethod, loginHandler.nonce);
      loginParams = await loginHandler.handleLoginWindow({
        locationReplaceOnRedirect: this.config.locationReplaceOnRedirect,
        popupFeatures: this.config.popupFeatures,
      });
      if (this.config.uxMode === UX_MODE.REDIRECT) return null;
    }

    const userInfo = await loginHandler.getUserInfo(loginParams);
    if (registerOnly) {
      const { torusNodeEndpoints, torusNodePub } = await this.nodeDetailManager.getNodeDetails();
      const torusPubKey = await this.torus.getPublicAddress(torusNodeEndpoints, torusNodePub, { verifier, verifierId: userInfo.verifierId }, true);
      const res = {
        userInfo: {
          ...userInfo,
          ...loginParams,
        },
      };
      if (typeof torusPubKey === "string") {
        throw new Error("should have returned extended pub key");
      }
      const torusKey: TorusKey = {
        pubKey: {
          pub_key_X: torusPubKey.X,
          pub_key_Y: torusPubKey.Y,
        },
        publicAddress: torusPubKey.address,
        privateKey: null,
        metadataNonce: null,
      };
      return { ...res, ...torusKey };
    }

    const torusKey = await this.getTorusKey(
      verifier,
      userInfo.verifierId,
      { verifier_id: userInfo.verifierId },
      loginParams.idToken || loginParams.accessToken,
      userInfo.extraVerifierParams
    );
    return {
      ...torusKey,
      userInfo: {
        ...userInfo,
        ...loginParams,
      },
    };
  }

  async triggerAggregateLogin(args: AggregateLoginParams): Promise<TorusAggregateLoginResponse> {
    // This method shall break if any of the promises fail. This behaviour is intended
    const { aggregateVerifierType, verifierIdentifier, subVerifierDetailsArray } = args;
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
      const { clientId, typeOfLogin, verifier, jwtParams, hash, queryParameters, customState } = subVerifierDetail;
      const loginHandler: ILoginHandler = createHandler({
        typeOfLogin,
        clientId,
        verifier,
        redirect_uri: this.config.redirect_uri,
        redirectToOpener: this.config.redirectToOpener,
        jwtParams,
        uxMode: this.config.uxMode,
        customState,
      });
      // We let the user login to each verifier in a loop. Don't wait for key derivation here.!
      let loginParams: LoginWindowResponse;
      if (hash && queryParameters) {
        const { error, hashParameters, instanceParameters } = handleRedirectParameters(hash, queryParameters);
        if (error) throw new Error(error);
        const { access_token: accessToken, id_token: idToken, ...rest } = hashParameters;
        // State has to be last here otherwise it will be overwritten
        loginParams = { accessToken, idToken, ...rest, state: instanceParameters };
      } else {
        clearOrphanedLoginDetails(this.config.redirectParamsStorageMethod);
        storeLoginDetails({ method: TORUS_METHOD.TRIGGER_AGGREGATE_LOGIN, args }, this.config.redirectParamsStorageMethod, loginHandler.nonce);
        // eslint-disable-next-line no-await-in-loop
        loginParams = await loginHandler.handleLoginWindow({
          locationReplaceOnRedirect: this.config.locationReplaceOnRedirect,
          popupFeatures: this.config.popupFeatures,
        });
        if (this.config.uxMode === UX_MODE.REDIRECT) return null;
      }
      // Fail the method even if one promise fails

      userInfoPromises.push(loginHandler.getUserInfo(loginParams));
      loginParamsArray.push(loginParams);
    }
    const _userInfoArray = await Promise.all(userInfoPromises);
    const userInfoArray = _userInfoArray.map((userInfo) => ({ ...userInfo, aggregateVerifier: verifierIdentifier }));
    const aggregateVerifierParams = { verify_params: [], sub_verifier_ids: [], verifier_id: "" };
    const aggregateIdTokenSeeds = [];
    let aggregateVerifierId = "";
    let extraVerifierParams = {};
    for (let index = 0; index < subVerifierDetailsArray.length; index += 1) {
      const loginParams = loginParamsArray[index];
      const { idToken, accessToken } = loginParams;
      const userInfo = userInfoArray[index];
      aggregateVerifierParams.verify_params.push({ verifier_id: userInfo.verifierId, idtoken: idToken || accessToken });
      aggregateVerifierParams.sub_verifier_ids.push(userInfo.verifier);
      aggregateIdTokenSeeds.push(idToken || accessToken);
      aggregateVerifierId = userInfo.verifierId; // using last because idk
      extraVerifierParams = userInfo.extraVerifierParams;
    }
    aggregateIdTokenSeeds.sort();
    const aggregateIdToken = keccak256(aggregateIdTokenSeeds.join(String.fromCharCode(29))).slice(2);
    aggregateVerifierParams.verifier_id = aggregateVerifierId;
    const torusKey = await this.getTorusKey(verifierIdentifier, aggregateVerifierId, aggregateVerifierParams, aggregateIdToken, extraVerifierParams);
    return {
      ...torusKey,
      userInfo: userInfoArray.map((x, index) => ({ ...x, ...loginParamsArray[index] })),
    };
  }

  //
  async triggerHybridAggregateLogin(args: HybridAggregateLoginParams): Promise<TorusHybridAggregateLoginResponse> {
    const { singleLogin, aggregateLoginParams } = args;
    // This method shall break if any of the promises fail. This behaviour is intended
    if (!this.isInitialized) {
      throw new Error("Not initialized yet");
    }
    if (
      !aggregateLoginParams.aggregateVerifierType ||
      !aggregateLoginParams.verifierIdentifier ||
      !Array.isArray(aggregateLoginParams.subVerifierDetailsArray)
    ) {
      throw new Error("Invalid params");
    }
    if (
      aggregateLoginParams.aggregateVerifierType === AGGREGATE_VERIFIER.SINGLE_VERIFIER_ID &&
      aggregateLoginParams.subVerifierDetailsArray.length !== 1
    ) {
      throw new Error("Single id verifier can only have one sub verifier");
    }
    const { typeOfLogin, clientId, verifier, jwtParams, hash, queryParameters, customState } = singleLogin;
    const loginHandler: ILoginHandler = createHandler({
      typeOfLogin,
      clientId,
      verifier,
      redirect_uri: this.config.redirect_uri,
      redirectToOpener: this.config.redirectToOpener,
      jwtParams,
      uxMode: this.config.uxMode,
      customState,
    });
    let loginParams: LoginWindowResponse;
    if (hash && queryParameters) {
      const { error, hashParameters, instanceParameters } = handleRedirectParameters(hash, queryParameters);
      if (error) throw new Error(error);
      const { access_token: accessToken, id_token: idToken, ...rest } = hashParameters;
      // State has to be last here otherwise it will be overwritten
      loginParams = { accessToken, idToken, ...rest, state: instanceParameters };
    } else {
      clearOrphanedLoginDetails(this.config.redirectParamsStorageMethod);
      storeLoginDetails({ method: TORUS_METHOD.TRIGGER_AGGREGATE_HYBRID_LOGIN, args }, this.config.redirectParamsStorageMethod, loginHandler.nonce);
      loginParams = await loginHandler.handleLoginWindow({
        locationReplaceOnRedirect: this.config.locationReplaceOnRedirect,
        popupFeatures: this.config.popupFeatures,
      });
      if (this.config.uxMode === UX_MODE.REDIRECT) return null;
    }

    const userInfo = await loginHandler.getUserInfo(loginParams);
    const torusKey1Promise = this.getTorusKey(
      verifier,
      userInfo.verifierId,
      { verifier_id: userInfo.verifierId },
      loginParams.idToken || loginParams.accessToken,
      userInfo.extraVerifierParams
    );

    const { verifierIdentifier, subVerifierDetailsArray } = aggregateLoginParams;
    const aggregateVerifierParams = { verify_params: [], sub_verifier_ids: [], verifier_id: "" };
    const aggregateIdTokenSeeds = [];
    let aggregateVerifierId = "";
    for (let index = 0; index < subVerifierDetailsArray.length; index += 1) {
      const sub = subVerifierDetailsArray[index];
      const { idToken, accessToken } = loginParams;
      aggregateVerifierParams.verify_params.push({ verifier_id: userInfo.verifierId, idtoken: idToken || accessToken });
      aggregateVerifierParams.sub_verifier_ids.push(sub.verifier);
      aggregateIdTokenSeeds.push(idToken || accessToken);
      aggregateVerifierId = userInfo.verifierId; // using last because idk
    }
    aggregateIdTokenSeeds.sort();
    const aggregateIdToken = keccak256(aggregateIdTokenSeeds.join(String.fromCharCode(29))).slice(2);
    aggregateVerifierParams.verifier_id = aggregateVerifierId;
    const torusKey2Promise = this.getTorusKey(
      verifierIdentifier,
      aggregateVerifierId,
      aggregateVerifierParams,
      aggregateIdToken,
      userInfo.extraVerifierParams
    );
    const [torusKey1, torusKey2] = await Promise.all([torusKey1Promise, torusKey2Promise]);
    return {
      singleLogin: {
        userInfo: { ...userInfo, ...loginParams },
        ...torusKey1,
      },
      aggregateLogins: [torusKey2],
    };
  }

  async getTorusKey(
    verifier: string,
    verifierId: string,
    verifierParams: { verifier_id: string },
    idToken: string,
    additionalParams?: extraParams
  ): Promise<TorusKey> {
    const { torusNodeEndpoints, torusNodePub, torusIndexes } = await this.nodeDetailManager.getNodeDetails();
    const response = await this.torus.getPublicAddress(torusNodeEndpoints, torusNodePub, { verifier, verifierId }, true);
    log.info("New private key assigned to user at address ", response);
    const data = await this.torus.retrieveShares(torusNodeEndpoints, torusIndexes, verifier, verifierParams, idToken, additionalParams);
    if (typeof response === "string") throw new Error("must use extended pub key");
    if (data.ethAddress.toLowerCase() !== response.address.toLowerCase()) {
      throw new Error("data ethAddress does not match response address");
    }
    return {
      publicAddress: data.ethAddress.toString(),
      privateKey: data.privKey.toString(),
      metadataNonce: data.metadataNonce.toString("hex"),
      pubKey: {
        pub_key_X: response.X,
        pub_key_Y: response.Y,
      },
    };
  }

  async getAggregateTorusKey(
    verifier: string,
    verifierId: string, // unique identifier for user e.g. sub on jwt
    subVerifierInfoArray: TorusSubVerifierInfo[]
  ): Promise<TorusKey> {
    const aggregateVerifierParams = { verify_params: [], sub_verifier_ids: [], verifier_id: "" };
    const aggregateIdTokenSeeds = [];
    let extraVerifierParams = {};
    for (let index = 0; index < subVerifierInfoArray.length; index += 1) {
      const userInfo = subVerifierInfoArray[index];
      aggregateVerifierParams.verify_params.push({ verifier_id: verifierId, idtoken: userInfo.idToken });
      aggregateVerifierParams.sub_verifier_ids.push(userInfo.verifier);
      aggregateIdTokenSeeds.push(userInfo.idToken);
      extraVerifierParams = userInfo.extraVerifierParams;
    }
    aggregateIdTokenSeeds.sort();
    const aggregateIdToken = keccak256(aggregateIdTokenSeeds.join(String.fromCharCode(29))).slice(2);
    aggregateVerifierParams.verifier_id = verifierId;
    return this.getTorusKey(verifier, verifierId, aggregateVerifierParams, aggregateIdToken, extraVerifierParams);
  }

  async getRedirectResult({ replaceUrl = true, clearLoginDetails = true }: RedirectResultParams = {}): Promise<RedirectResult> {
    await this.init({ skipInit: true });
    const url = new URL(window.location.href);
    const hash = url.hash.substr(1);
    const queryParams = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    if (replaceUrl) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState(null, "", cleanUrl);
    }

    if (!hash && Object.keys(queryParams).length === 0) {
      throw new Error("Unable to fetch result from redirect");
    }

    const { error, instanceParameters, hashParameters } = handleRedirectParameters(hash, queryParams);

    const { instanceId } = instanceParameters;

    log.info(instanceId, "instanceId");

    const { args, method, ...rest } = retrieveLoginDetails(this.config.redirectParamsStorageMethod, instanceId);
    log.info(args, method);

    if (clearLoginDetails) {
      clearLoginDetailsStorage(this.config.redirectParamsStorageMethod, instanceId);
    }

    if (error) {
      const errorInstance = `Error: ${error}. Instance params: ${JSON.stringify(instanceParameters || {})}. Hash params: ${JSON.stringify(
        hashParameters || {}
      )}`;

      return { error: errorInstance, state: instanceParameters || {}, method, result: {}, hashParameters, args };
    }

    let result: unknown;

    try {
      if (method === TORUS_METHOD.TRIGGER_LOGIN) {
        const methodArgs = args as SubVerifierDetails & { registerOnly?: boolean };
        methodArgs.hash = hash;
        methodArgs.queryParameters = queryParams;
        result = await this.triggerLogin(methodArgs);
      } else if (method === TORUS_METHOD.TRIGGER_AGGREGATE_LOGIN) {
        const methodArgs = args as AggregateLoginParams;
        methodArgs.subVerifierDetailsArray.forEach((x) => {
          x.hash = hash;
          x.queryParameters = queryParams;
        });
        result = await this.triggerAggregateLogin(methodArgs);
      } else if (method === TORUS_METHOD.TRIGGER_AGGREGATE_HYBRID_LOGIN) {
        const methodArgs = args as HybridAggregateLoginParams;
        methodArgs.singleLogin.hash = hash;
        methodArgs.singleLogin.queryParameters = queryParams;
        result = await this.triggerHybridAggregateLogin(methodArgs);
      }
    } catch (err) {
      log.error(err);
      return {
        error: `Could not get result from torus nodes ${err?.message || ""}`,
        state: instanceParameters || {},
        method,
        result: {},
        hashParameters,
        args,
        ...rest,
      };
    }

    if (!result)
      return {
        error: "Unsupported method type",
        state: instanceParameters || {},
        method,
        result: {},
        hashParameters,
        args,
        ...rest,
      };

    return { method, result, state: instanceParameters || {}, hashParameters, args, ...rest };
  }
}

export default DirectWebSDK;
