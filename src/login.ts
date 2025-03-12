import { type INodeDetails, TORUS_NETWORK_TYPE } from "@toruslabs/constants";
import { NodeDetailManager } from "@toruslabs/fetch-node-details";
import { keccak256, type KeyType, Torus, TorusKey } from "@toruslabs/torus.js";

import createHandler from "./handlers/HandlerFactory";
import { registerServiceWorker } from "./registerServiceWorker";
import SentryHandler from "./sentry";
import { SENTRY_TXNS, UX_MODE, UX_MODE_TYPE } from "./utils/enums";
import { serializeError } from "./utils/error";
import { handleRedirectParameters, isFirefox, padUrlString } from "./utils/helpers";
import {
  CustomAuthArgs,
  CustomAuthLoginParams,
  ExtraParams,
  ILoginHandler,
  InitParams,
  LoginWindowResponse,
  RedirectResult,
  RedirectResultParams,
  TorusLoginResponse,
  VerifierParams,
} from "./utils/interfaces";
import log from "./utils/loglevel";
import StorageHelper from "./utils/StorageHelper";

class CustomAuth {
  isInitialized: boolean;

  config: {
    baseUrl: string;
    redirectToOpener: boolean;
    redirect_uri: string;
    uxMode: UX_MODE_TYPE;
    locationReplaceOnRedirect: boolean;
    popupFeatures: string;
    useDkg?: boolean;
    web3AuthClientId: string;
    web3AuthNetwork: TORUS_NETWORK_TYPE;
    keyType: KeyType;
    nodeDetails: INodeDetails;
    checkCommitment: boolean;
  };

  torus: Torus;

  nodeDetailManager: NodeDetailManager;

  storageHelper: StorageHelper;

  sentryHandler: SentryHandler;

  constructor({
    baseUrl,
    network,
    enableLogging = false,
    redirectToOpener = false,
    redirectPathName = "redirect",
    apiKey = "torus-default",
    uxMode = UX_MODE.POPUP,
    locationReplaceOnRedirect = false,
    popupFeatures,
    storageServerUrl = "https://session.web3auth.io",
    sentry,
    enableOneKey = false,
    web3AuthClientId,
    useDkg,
    metadataUrl = "https://metadata.tor.us",
    keyType = "secp256k1",
    serverTimeOffset = 0,
    nodeDetails,
    checkCommitment = true,
  }: CustomAuthArgs) {
    if (!web3AuthClientId) throw new Error("Please provide a valid web3AuthClientId in constructor");
    if (!network) throw new Error("Please provide a valid network in constructor");
    this.isInitialized = false;
    const baseUri = new URL(baseUrl);
    this.config = {
      baseUrl: padUrlString(baseUri),
      get redirect_uri() {
        return `${this.baseUrl}${redirectPathName}`;
      },
      redirectToOpener,
      uxMode,
      locationReplaceOnRedirect,
      popupFeatures,
      useDkg,
      web3AuthClientId,
      web3AuthNetwork: network,
      keyType,
      nodeDetails,
      checkCommitment,
    };
    const torus = new Torus({
      network,
      enableOneKey,
      serverTimeOffset,
      clientId: web3AuthClientId,
      legacyMetadataHost: metadataUrl,
      keyType,
    });
    Torus.setAPIKey(apiKey);
    this.torus = torus;
    this.nodeDetailManager = new NodeDetailManager({ network });
    if (enableLogging) log.enableAll();
    else log.disableAll();
    this.storageHelper = new StorageHelper(storageServerUrl);
    this.sentryHandler = new SentryHandler(sentry);
  }

  async init({ skipSw = false, skipInit = false, skipPrefetch = false }: InitParams = {}): Promise<void> {
    this.storageHelper.init();
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

  async triggerLogin(args: CustomAuthLoginParams): Promise<TorusLoginResponse> {
    const { authConnectionId, authConnection, clientId, jwtParams, hash, queryParameters, customState, groupedAuthConnectionId } = args;
    if (!this.isInitialized) {
      throw new Error("Not initialized yet");
    }
    const loginHandler: ILoginHandler = createHandler({
      authConnection,
      clientId,
      authConnectionId,
      redirect_uri: this.config.redirect_uri,
      redirectToOpener: this.config.redirectToOpener,
      jwtParams,
      uxMode: this.config.uxMode,
      customState,
      web3AuthClientId: this.config.web3AuthClientId,
      web3AuthNetwork: this.config.web3AuthNetwork,
    });

    let loginParams: LoginWindowResponse;
    if (hash && queryParameters) {
      const { error, hashParameters, instanceParameters } = handleRedirectParameters(hash, queryParameters);
      if (error) throw new Error(error);
      const { access_token: accessToken, id_token: idToken, tgAuthResult, ...rest } = hashParameters;
      // State has to be last here otherwise it will be overwritten
      loginParams = { accessToken, idToken: idToken || tgAuthResult || "", ...rest, state: instanceParameters };
    } else {
      this.storageHelper.clearOrphanedLoginDetails();
      if (this.config.uxMode === UX_MODE.REDIRECT) {
        await this.storageHelper.storeLoginDetails({ args }, loginHandler.nonce);
      }
      loginParams = await loginHandler.handleLoginWindow({
        locationReplaceOnRedirect: this.config.locationReplaceOnRedirect,
        popupFeatures: this.config.popupFeatures,
      });
      if (this.config.uxMode === UX_MODE.REDIRECT) return null;
    }

    const userInfo = await loginHandler.getUserInfo(loginParams);

    const verifierParams: VerifierParams = { verifier_id: userInfo.userId };
    let aggregateIdToken = "";
    const finalIdToken = loginParams.idToken || loginParams.accessToken;

    if (groupedAuthConnectionId) {
      verifierParams["verify_params"] = [{ verifier_id: userInfo.userId, idtoken: finalIdToken }];
      verifierParams["sub_verifier_ids"] = [userInfo.authConnectionId];
      aggregateIdToken = keccak256(Buffer.from(finalIdToken, "utf8")).slice(2);
    }

    const torusKey = await this.getTorusKey(
      groupedAuthConnectionId || authConnectionId,
      userInfo.userId,
      verifierParams,
      aggregateIdToken || finalIdToken,
      userInfo.extraConnectionParams
    );

    return {
      ...torusKey,
      userInfo: {
        ...userInfo,
        ...loginParams,
      },
    };
  }

  async getTorusKey(
    verifier: string,
    verifierId: string,
    verifierParams: { verifier_id: string },
    idToken: string,
    additionalParams?: ExtraParams
  ): Promise<TorusKey> {
    const nodeDetails = await this.sentryHandler.startSpan(
      {
        name: SENTRY_TXNS.FETCH_NODE_DETAILS,
      },
      async () => {
        if (this.config.nodeDetails) {
          return this.config.nodeDetails;
        }
        return this.nodeDetailManager.getNodeDetails({ verifier, verifierId });
      }
    );

    log.debug("torus-direct/getTorusKey", { torusNodeEndpoints: nodeDetails.torusNodeEndpoints });

    const sharesResponse = await this.sentryHandler.startSpan(
      {
        name: SENTRY_TXNS.FETCH_SHARES,
      },
      async () => {
        return this.torus.retrieveShares({
          endpoints: nodeDetails.torusNodeEndpoints,
          indexes: nodeDetails.torusIndexes,
          verifier,
          verifierParams,
          idToken,
          nodePubkeys: nodeDetails.torusNodePub,
          extraParams: {
            ...additionalParams,
          },
          useDkg: this.config.useDkg,
          checkCommitment: this.config.checkCommitment,
        });
      }
    );

    log.debug("torus-direct/getTorusKey", { retrieveShares: sharesResponse });
    return sharesResponse;
  }

  async getRedirectResult({
    replaceUrl = true,
    clearLoginDetails = true,
    storageData = undefined,
  }: RedirectResultParams = {}): Promise<RedirectResult> {
    await this.init({ skipInit: true });
    const url = new URL(window.location.href);
    const hash = url.hash.substring(1);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value: string, key: string) => {
      queryParams[key] = value;
    });

    if (!hash && Object.keys(queryParams).length === 0) {
      throw new Error("Found Empty hash and query parameters. This can happen if user reloads the page");
    }

    const { error, instanceParameters, hashParameters } = handleRedirectParameters(hash, queryParams);

    const { instanceId } = instanceParameters;

    log.info(instanceId, "instanceId");

    const loginDetails = storageData || (await this.storageHelper.retrieveLoginDetails(instanceId));
    const { args, ...rest } = loginDetails || {};
    log.info(args);

    let result: TorusLoginResponse;

    if (error) {
      return { error, state: instanceParameters || {}, result: {}, hashParameters, args };
    }

    try {
      args.hash = hash;
      args.queryParameters = queryParams;
      result = await this.triggerLogin(args);
    } catch (err: unknown) {
      const serializedError = await serializeError(err);
      log.error(serializedError);
      if (clearLoginDetails) {
        this.storageHelper.clearLoginDetailsStorage(instanceId);
      }
      return {
        error: `${serializedError.message || ""}`,
        state: instanceParameters || {},
        result: {},
        hashParameters,
        args,
        ...rest,
      };
    }

    if (!result)
      return {
        error: `Init parameters not found. It might be because storage is not available. Please retry the login in a different browser. Used storage method: ${this.storageHelper.storageMethodUsed}`,
        state: instanceParameters || {},
        result: {},
        hashParameters,
        args,
        ...rest,
      };

    if (replaceUrl) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: cleanUrl, url: cleanUrl }, "", cleanUrl);
    }

    if (clearLoginDetails) {
      this.storageHelper.clearLoginDetailsStorage(instanceId);
    }

    return { result, state: instanceParameters || {}, hashParameters, args, ...rest };
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
      } catch {
        resolveFn();
      }
    });
  }
}

export default CustomAuth;
