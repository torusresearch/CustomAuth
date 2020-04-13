import randomId from "@chaitanyapotti/random-id";
import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";
import log from "loglevel";

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
    };
    const torus = new Torus();
    torus.instanceId = randomId();
    this.torus = torus;
    this.nodeDetailManager = new NodeDetailManager({ network, proxyAddress: proxyContractAddress });
    this.nodeDetailManager.getNodeDetails();
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

  triggerLogin(typeOfLogin, verifier) {
    return new Promise((resolve, reject) => {
      log.info("Verifier: ", verifier);
      if (!this.isInitialized) {
        reject(new Error("Not initialized yet"));
        return;
      }
      if (!verifier || !typeOfLogin) {
        reject(new Error("Invalid params"));
        return;
      }
      if (!this.config[`${typeOfLogin.toUpperCase()}_CLIENT_ID`]) {
        reject(new Error("Client id is not available"));
        return;
      }
      const state = encodeURIComponent(
        window.btoa(
          JSON.stringify({
            instanceId: this.torus.instanceId,
            verifier,
          })
        )
      );
      const handleWindow = handleLoginWindow(verifier, resolve, reject).bind(this);
      if (typeOfLogin === GOOGLE) {
        const scope = "profile email openid";
        const responseType = "token id_token";
        const prompt = "consent select_account";
        const finalUrl =
          `https://accounts.google.com/o/oauth2/v2/auth?response_type=${responseType}&client_id=${this.config.GOOGLE_CLIENT_ID}` +
          `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}&nonce=${
            this.torus.instanceId
          }&prompt=${prompt}`;
        handleWindow(finalUrl, googleHandler);
      } else if (typeOfLogin === FACEBOOK) {
        const scope = "public_profile email";
        const responseType = "token";
        const finalUrl =
          `https://www.facebook.com/v6.0/dialog/oauth?response_type=${responseType}&client_id=${this.config.FACEBOOK_CLIENT_ID}` +
          `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}`;
        handleWindow(finalUrl, facebookHandler);
      } else if (typeOfLogin === TWITCH) {
        const finalUrl =
          `https://id.twitch.tv/oauth2/authorize?client_id=${this.config.TWITCH_CLIENT_ID}&redirect_uri=` +
          `${this.config.redirect_uri}&response_type=token&scope=user:read:email&state=${state}&force_verify=true`;

        handleWindow(finalUrl, twitchHandler);
      } else if (typeOfLogin === REDDIT) {
        const finalUrl =
          `https://www.reddit.com/api/v1/authorize?client_id=${this.config.REDDIT_CLIENT_ID}&redirect_uri=` +
          `${this.config.redirect_uri}&response_type=token&scope=identity&state=${state}`;

        handleWindow(finalUrl, redditHandler);
      } else if (typeOfLogin === DISCORD) {
        const scope = encodeURIComponent("identify email");
        const finalUrl =
          `https://discordapp.com/api/oauth2/authorize?response_type=token&client_id=${this.config.DISCORD_CLIENT_ID}` +
          `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}`;
        handleWindow(finalUrl, discordHandler);
      }
    });
  }

  async handleLogin(verifier, verifierId, verifierParams, idToken) {
    const { torusNodeEndpoints, torusNodePub, torusIndexes } = await this.nodeDetailManager.getNodeDetails();
    const response = await this.torus.getPublicAddress(torusNodeEndpoints, torusNodePub, { verifier, verifierId });
    log.info("New private key assigned to user at address ", response);
    const data = await this.torus.retrieveShares(torusNodeEndpoints, torusIndexes, verifier, verifierParams, idToken);
    if (data.ethAddress.toLowerCase() !== response.toLowerCase()) throw new Error("Invalid");
    log.info(data);
    return data;
  }
}

export default DirectWebSDK;
