import randomId from "@chaitanyapotti/random-id";
import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";
import log from "loglevel";
import Web3Utils from "web3-utils";

import { discordHandler, facebookHandler, googleHandler, handleLoginWindow, redditHandler, twitchHandler } from "./handlers";
import { registerServiceWorker } from "./registerServiceWorker";
import { DISCORD, FACEBOOK, GOOGLE, MAINNET, REDDIT, TWITCH } from "./utils/enums";

class DirectWebSDK {
  constructor({
    GOOGLE_CLIENT_ID,
    FACEBOOK_CLIENT_ID,
    TWITCH_CLIENT_ID,
    REDDIT_CLIENT_ID,
    DISCORD_CLIENT_ID,
    baseUrl = "http://localhost:3000/serviceworker/",
    network = MAINNET,
    proxyContractAddress = "0x638646503746d5456209e33a2ff5e3226d698bea",
    enableLogging = false,
    redirectToOpener = false,
  } = {}) {
    this.isInitialized = false;
    const baseUri = new URL(baseUrl);
    this.config = {
      GOOGLE_CLIENT_ID,
      FACEBOOK_CLIENT_ID,
      TWITCH_CLIENT_ID,
      REDDIT_CLIENT_ID,
      DISCORD_CLIENT_ID,
      baseUrl: baseUri.href.endsWith("/") ? baseUri.href : `${baseUri.href}/`,
      get redirect_uri() {
        return `${this.baseUrl}redirect`;
      },
      redirectToOpener,
    };
    const torus = new Torus();
    torus.instanceId = randomId();
    this.torus = torus;
    this.nodeDetailManager = new NodeDetailManager({ network, proxyAddress: proxyContractAddress });
    this.nodeDetailManager.getNodeDetails();
    this.loginCount = 0;
    this.requiredLoginCount = 0;
    this.loginParams = [];
    if (enableLogging) log.enableAll();
    else log.disableAll();
  }

  async init() {
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

  triggerLogin(typeOfLogin, verifier, ...subVerifierDetails) {
    return new Promise((resolve, reject) => {
      log.info("Login params: ", typeOfLogin, verifier, subVerifierDetails);
      if (!this.isInitialized) {
        reject(new Error("Not initialized yet"));
        return;
      }
      if (!verifier || !typeOfLogin) {
        reject(new Error("Invalid params"));
        return;
      }
      // if (!this.config[`${typeOfLogin.toUpperCase()}_CLIENT_ID`]) {
      //   reject(new Error("Client id is not available"));
      //   return;
      // }
      let singleLoginParams = [];
      const listOfAggregateLoginTypes = ["single_id_verifier", "and_aggregate_verifier", "or_aggregate_verifier"];
      const aggregateLoginMode = listOfAggregateLoginTypes.includes(typeOfLogin);
      if (aggregateLoginMode) {
        // for aggregate logins
        if (typeOfLogin === "single_id_verifier") {
          log.info("set to single_id_verifier login");
          if (subVerifierDetails.length === 0) {
            reject(new Error("no sub verifiers provided"));
            return;
          }
          this.loginParams = [];
          this.requiredLoginCount = subVerifierDetails.length;
          singleLoginParams = subVerifierDetails;
        }
        this.handleLogin = this.storeLoginParams.bind(this, typeOfLogin);
      } else {
        // for single logins
        this.requiredLoginCount = 1;
        singleLoginParams.push({ verifier, typeOfLogin, ...this.config });
        this.handleLogin = this.handleSingleLogin.bind(this);
      }
      log.info("starting single logins with", singleLoginParams);
      const loginPromises = [];
      for (let i = 0; i < this.requiredLoginCount; i += 1) {
        loginPromises.push(this.startSingleLogin.bind(this)(singleLoginParams[i].typeOfLogin, singleLoginParams[i].verifier, singleLoginParams[i]));
      }
      Promise.all(loginPromises)
        .then((result) => {
          if (aggregateLoginMode) {
            const data = this.handleAggregateLogin(typeOfLogin, verifier);
            resolve(data);
            return data;
          }
          resolve(result);
          return result;
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async startSingleLogin(typeOfLogin, verifier, extraParams) {
    const state = encodeURIComponent(
      window.btoa(
        JSON.stringify({
          instanceId: this.torus.instanceId,
          verifier,
          redirectToOpener: this.config.redirectToOpener,
        })
      )
    );
    return new Promise((resolve, reject) => {
      const handleWindow = handleLoginWindow(verifier, this.config.redirectToOpener, resolve, reject).bind(this);
      if (typeOfLogin === GOOGLE) {
        const scope = "profile email openid";
        const responseType = "token id_token";
        const prompt = "consent select_account";
        const finalUrl =
          `https://accounts.google.com/o/oauth2/v2/auth?response_type=${responseType}&client_id=${extraParams.GOOGLE_CLIENT_ID}` +
          `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}&nonce=${
            this.torus.instanceId
          }&prompt=${prompt}`;
        handleWindow(finalUrl, googleHandler);
      } else if (typeOfLogin === FACEBOOK) {
        const scope = "public_profile email";
        const responseType = "token";
        const finalUrl =
          `https://www.facebook.com/v6.0/dialog/oauth?response_type=${responseType}&client_id=${extraParams.FACEBOOK_CLIENT_ID}` +
          `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}`;
        handleWindow(finalUrl, facebookHandler);
      } else if (typeOfLogin === TWITCH) {
        const finalUrl =
          `https://id.twitch.tv/oauth2/authorize?client_id=${extraParams.TWITCH_CLIENT_ID}&redirect_uri=` +
          `${this.config.redirect_uri}&response_type=token&scope=user:read:email&state=${state}&force_verify=true`;
        handleWindow(finalUrl, twitchHandler);
      } else if (typeOfLogin === REDDIT) {
        const finalUrl =
          `https://www.reddit.com/api/v1/authorize?client_id=${extraParams.REDDIT_CLIENT_ID}&redirect_uri=` +
          `${this.config.redirect_uri}&response_type=token&scope=identity&state=${state}`;
        handleWindow(finalUrl, redditHandler);
      } else if (typeOfLogin === DISCORD) {
        const scope = encodeURIComponent("identify email");
        const finalUrl =
          `https://discordapp.com/api/oauth2/authorize?response_type=token&client_id=${extraParams.DISCORD_CLIENT_ID}` +
          `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}`;
        handleWindow(finalUrl, discordHandler);
      }
    });
  }

  async handleSingleLogin(verifier, verifierId, verifierParams, idToken) {
    log.info("login called with arguments ", verifier, verifierId, verifierParams, idToken);
    const { torusNodeEndpoints, torusNodePub, torusIndexes } = await this.nodeDetailManager.getNodeDetails();
    const response = await this.torus.getPublicAddress(torusNodeEndpoints, torusNodePub, { verifier, verifierId });
    log.info("private key assigned to user at address ", response);
    const data = await this.torus.retrieveShares(torusNodeEndpoints, torusIndexes, verifier, verifierParams, idToken);
    if (data.ethAddress.toLowerCase() !== response.toLowerCase()) throw new Error("Invalid");
    log.info(data);
    return data;
  }

  async storeLoginParams(typeOfAggregateLogin, verifier, verifierId, verifierParams, idToken) {
    log.info("storeLoginParams with arguments ", typeOfAggregateLogin, verifier, verifierId, verifierParams, idToken);
    this.loginParams.push({ verifier, verifierId, verifierParams, idToken });
    return { ethAddress: "", privKey: "" };
  }

  async handleAggregateLogin(typeOfAggregateLogin, verifier) {
    log.info("handleAggregateLogin called", verifier);
    const aggregateVerifierParams = { verify_params: [], sub_verifier_ids: [] };
    const aggregateIdTokenSeeds = [];
    let aggregateVerifierId = "";
    // req = []byte(`{"verifieridentifier":"test_single","verifier_id":"id1",
    // "sub_verifier_ids":["sub_test2"],"verify_params":[{"idtoken":"dlublu","id":"id1"}],
    // "idtoken":"052df4fd5c6c78fa4cc6798a385f54d667e97c6dd0e3b74fd36103861e8b18ed"}`)
    this.loginParams.forEach(function (item) {
      aggregateVerifierParams.verify_params.push({ ...item.verifierParams, idtoken: item.idToken });
      aggregateVerifierParams.sub_verifier_ids.push(item.verifier);
      aggregateIdTokenSeeds.push(item.idToken);
      aggregateVerifierId = item.verifierId;
    });
    aggregateIdTokenSeeds.sort();
    console.log("token seeds", aggregateIdTokenSeeds);
    log.info("token seeds", aggregateIdTokenSeeds);
    const aggregateIdToken = Web3Utils.keccak256(aggregateIdTokenSeeds.join(String.fromCharCode(29)));
    const pubKeyDetails = this.handleSingleLogin(verifier, aggregateVerifierId, aggregateVerifierParams, aggregateIdToken);
    return {
      verifierId: aggregateVerifierId,
      verifier,
      publicAddress: pubKeyDetails.ethAddress,
      privateKey: pubKeyDetails.privKey,
    };
  }
}

export default DirectWebSDK;
