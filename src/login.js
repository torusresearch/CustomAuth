import randomId from "@chaitanyapotti/random-id";
import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";
import { BroadcastChannel } from "broadcast-channel";
import log from "loglevel";

import { registerServiceWorker } from "./registerServiceWorker";
import { DISCORD, FACEBOOK, GOOGLE, MAINNET, REDDIT, TWITCH } from "./utils/enums";
import { get, remove } from "./utils/httpHelpers";
import PopupHandler from "./utils/PopupHandler";

const broadcastChannelOptions = {
  // type: 'localstorage', // (optional) enforce a type, oneOf['native', 'idb', 'localstorage', 'node']
  webWorkerSupport: false, // (optional) set this to false if you know that your channel will never be used in a WebWorker (increases performance)
};

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

  triggerLogin(typeOfLogin = GOOGLE, verifier) {
    return new Promise((resolve, reject) => {
      log.info("Verifier: ", verifier);
      if (!this.isInitialized) {
        reject(new Error("Not initialized yet"));
        return;
      }
      if (!verifier) {
        reject(new Error("Invalid verifier"));
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
      const handleWindow = (url, handler) => {
        const verifierWindow = new PopupHandler({ url });
        const bc = new BroadcastChannel(`redirect_channel_${this.torus.instanceId}`, broadcastChannelOptions);
        bc.addEventListener("message", async (ev) => {
          try {
            const {
              instanceParams: { verifier: returnedVerifier },
              hashParams: verifierParameters,
            } = ev.data || {};
            if (ev.error && ev.error !== "") {
              log.error(ev.error);
              reject(ev.error);
              return;
            }
            if (ev.data && returnedVerifier === verifier) {
              log.info(ev.data);
              await handler(verifierParameters);
            }
          } catch (error) {
            log.error(error);
            reject(error);
          }
          bc.close();
          verifierWindow.close();
        });
        verifierWindow.open();
        verifierWindow.once("close", () => {
          bc.close();
          reject(new Error("user closed popup"));
        });
      };
      if (typeOfLogin === GOOGLE) {
        const scope = "profile email openid";
        const responseType = "token id_token";
        const prompt = "consent select_account";
        const finalUrl =
          `https://accounts.google.com/o/oauth2/v2/auth?response_type=${responseType}&client_id=${this.config.GOOGLE_CLIENT_ID}` +
          `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}&nonce=${
            this.torus.instanceId
          }&prompt=${prompt}`;
        const googleHandler = async (verifierParameters) => {
          const { access_token: accessToken, id_token: idToken } = verifierParameters;
          const userInfo = await get("https://www.googleapis.com/userinfo/v2/me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const { picture: profileImage, email, name } = userInfo || {};
          const pubKeyDetails = await this.handleLogin(
            verifier,
            email.toString().toLowerCase(),
            { verifier_id: email.toString().toLowerCase() },
            idToken
          );
          resolve({
            profileImage,
            name,
            email,
            verifierId: email.toString().toLowerCase(),
            verifier,
            publicAddress: pubKeyDetails.ethAddress,
            privateKey: pubKeyDetails.privKey,
          });
        };
        handleWindow(finalUrl, googleHandler);
      } else if (typeOfLogin === FACEBOOK) {
        const scope = "public_profile email";
        const responseType = "token";
        const finalUrl =
          `https://www.facebook.com/v6.0/dialog/oauth?response_type=${responseType}&client_id=${this.config.FACEBOOK_CLIENT_ID}` +
          `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}`;
        const facebookHandler = async (verifierParameters) => {
          const { access_token: accessToken } = verifierParameters;
          const userInfo = await get("https://graph.facebook.com/me?fields=name,email,picture.type(large)", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const { name, id, picture, email } = userInfo || {};
          const pubKeyDetails = await this.handleLogin(verifier, id.toString(), { verifier_id: id.toString() }, accessToken);
          resolve({
            profileImage: picture.data.url,
            name,
            email,
            verifierId: id.toString(),
            verifier,
            publicAddress: pubKeyDetails.ethAddress,
            privateKey: pubKeyDetails.privKey,
          });
          remove(`https://graph.facebook.com/me/permissions?access_token=${accessToken}`)
            .then((resp) => log.info(resp))
            .catch((error) => log.error(error));
        };
        handleWindow(finalUrl, facebookHandler);
      } else if (typeOfLogin === TWITCH) {
        const finalUrl =
          `https://id.twitch.tv/oauth2/authorize?client_id=${this.config.TWITCH_CLIENT_ID}&redirect_uri=` +
          `${this.config.redirect_uri}&response_type=token&scope=user:read:email&state=${state}&force_verify=true`;
        const twitchHandler = async (verifierParameters) => {
          const { access_token: accessToken } = verifierParameters;
          const userInfo = await get("https://api.twitch.tv/helix/users", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const [{ profile_image_url: profileImage, display_name: name, email, id: verifierId }] = userInfo.data || {};
          const pubKeyDetails = await this.handleLogin(verifier, verifierId, { verifier_id: verifierId }, accessToken.toString());
          resolve({
            profileImage,
            name,
            email,
            verifierId,
            verifier,
            publicAddress: pubKeyDetails.ethAddress,
            privateKey: pubKeyDetails.privKey,
          });
        };
        handleWindow(finalUrl, twitchHandler);
      } else if (typeOfLogin === REDDIT) {
        const finalUrl =
          `https://www.reddit.com/api/v1/authorize?client_id=${this.config.REDDIT_CLIENT_ID}&redirect_uri=` +
          `${this.config.redirect_uri}&response_type=token&scope=identity&state=${state}`;
        const redditHandler = async (verifierParameters) => {
          const { access_token: accessToken } = verifierParameters;
          const userInfo = await get("https://oauth.reddit.com/api/v1/me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const { icon_img: profileImage, name } = userInfo || {};
          const pubKeyDetails = await this.handleLogin(
            verifier,
            name.toString().toLowerCase(),
            { verifier_id: name.toString().toLowerCase() },
            accessToken
          );
          resolve({
            profileImage: profileImage.split("?").length > 0 ? profileImage.split("?")[0] : profileImage,
            name,
            email: "",
            verifierId: name.toString().toLowerCase(),
            verifier,
            publicAddress: pubKeyDetails.ethAddress,
            privateKey: pubKeyDetails.privKey,
          });
        };
        handleWindow(finalUrl, redditHandler);
      } else if (typeOfLogin === DISCORD) {
        const scope = encodeURIComponent("identify email");
        const finalUrl =
          `https://discordapp.com/api/oauth2/authorize?response_type=token&client_id=${this.config.DISCORD_CLIENT_ID}` +
          `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}`;
        const discordHandler = async (verifierParameters) => {
          const { access_token: accessToken } = verifierParameters;
          const userInfo = await get("https://discordapp.com/api/users/@me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const { id, avatar, email, username: name, discriminator } = userInfo || {};
          const profileImage =
            avatar === null
              ? `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`
              : `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=2048`;
          const pubKeyDetails = await this.handleLogin(verifier, id.toString(), { verifier_id: id.toString() }, accessToken);
          resolve({
            profileImage,
            name: `${name}#${discriminator}`,
            email,
            verifierId: id.toString(),
            verifier,
            publicAddress: pubKeyDetails.ethAddress,
            privateKey: pubKeyDetails.privKey,
          });
        };
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
