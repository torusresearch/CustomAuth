import randomId from "@chaitanyapotti/random-id";
import NodeDetailManager from "@toruslabs/fetch-node-details";
import Torus from "@toruslabs/torus.js";
import { BroadcastChannel } from "broadcast-channel";
import jwtDecode from "jwt-decode";
import log from "loglevel";

import { DISCORD, FACEBOOK, GOOGLE, MAINNET, REDDIT, TWITCH } from "./utils/enums";
import { get } from "./utils/httpHelpers";
import PopupHandler from "./utils/PopupHandler";
import { broadcastChannelOptions } from "./utils/utils";

const torus = new Torus();

torus.instanceId = randomId();

class DirectWebSDK {
  constructor({
    GOOGLE_CLIENT_ID = "876733105116-i0hj3s53qiio5k95prpfmj0hp0gmgtor.apps.googleusercontent.com",
    FACEBOOK_APP_ID = "2554219104599979",
    TWITCH_CLIENT_ID = "tfppratfiloo53g1x133ofa4rc29px",
    REDDIT_CLIENT_ID = "dcQJYPaG481XyQ",
    DISCORD_CLIENT_ID = "630308572013527060",
    redirect_uri = "https://localhost:3000/redirect",
    network = MAINNET,
    proxyContractAddress = "0x638646503746d5456209e33a2ff5e3226d698bea",
    enableLogging = false,
    typeOfLogin = GOOGLE,
    verifier = GOOGLE
  } = {}) {
    this.config = {
      GOOGLE_CLIENT_ID,
      FACEBOOK_APP_ID,
      TWITCH_CLIENT_ID,
      REDDIT_CLIENT_ID,
      DISCORD_CLIENT_ID,
      redirect_uri
    };
    this.torus = torus;
    this.nodeDetailManager = new NodeDetailManager({ network, proxyAddress: proxyContractAddress });
    this.typeOfLogin = typeOfLogin;
    this.verifier = verifier;
    if (enableLogging) log.enableAll();
    else log.disableAll();
  }

  triggerLogin() {
    return new Promise((resolve, reject) => {
      log.info("Verifier: ", this.verifier);
      if (this.typeOfLogin === GOOGLE) {
        const state = encodeURIComponent(
          window.btoa(
            JSON.stringify({
              instanceId: torus.instanceId,
              verifier: this.verifier
            })
          )
        );
        const scope = "profile email openid";
        const responseType = "token id_token";
        const prompt = "consent select_account";
        const finalUrl =
          `https://accounts.google.com/o/oauth2/v2/auth?response_type=${responseType}&client_id=${this.config.GOOGLE_CLIENT_ID}` +
          `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}&nonce=${torus.instanceId}&prompt=${prompt}`;
        const googleWindow = new PopupHandler({ url: finalUrl });
        const bc = new BroadcastChannel(`redirect_channel_${torus.instanceId}`, broadcastChannelOptions);
        bc.addEventListener("message", async ev => {
          try {
            const {
              instanceParams: { verifier: returnedVerifier },
              hashParams: verifierParameters
            } = ev.data || {};
            if (ev.error && ev.error !== "") {
              log.error(ev.error);
              reject(ev.error);
              return;
            }
            if (ev.data && returnedVerifier === this.verifier) {
              log.info(ev.data);
              const { access_token: accessToken, id_token: idToken } = verifierParameters;
              const userInfo = await get("https://www.googleapis.com/userinfo/v2/me", {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              });
              const { picture: profileImage, email, name } = userInfo || {};
              const pubKeyDetails = await this.handleLogin(
                this.verifier,
                email.toString().toLowerCase(),
                { verifier_id: email.toString().toLowerCase() },
                idToken
              );
              resolve({
                profileImage,
                name,
                email,
                verifierId: email.toString().toLowerCase(),
                verifier: this.verifier,
                publicAddress: pubKeyDetails.ethAddress,
                privateKey: pubKeyDetails.privKey
              });
            }
          } catch (error) {
            log.error(error);
            reject(error);
            return;
          } finally {
            bc.close();
            googleWindow.close();
          }
        });
        googleWindow.open();
        googleWindow.once("close", () => {
          bc.close();
          reject(new Error("user closed popup"));
        });
      } else if (this.typeOfLogin === FACEBOOK) {
        const state = encodeURIComponent(
          window.btoa(
            JSON.stringify({
              instanceId: torus.instanceId,
              verifier: this.verifier
            })
          )
        );
        const scope = "public_profile email";
        const responseType = "token";
        const finalUrl =
          `https://www.facebook.com/v6.0/dialog/oauth?response_type=${responseType}&client_id=${this.config.FACEBOOK_APP_ID}` +
          `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}`;
        const facebookWindow = new PopupHandler({ url: finalUrl });
        const bc = new BroadcastChannel(`redirect_channel_${torus.instanceId}`, broadcastChannelOptions);
        bc.addEventListener("message", async ev => {
          try {
            const {
              instanceParams: { verifier: returnedVerifier },
              hashParams: verifierParameters
            } = ev.data || {};
            if (ev.error && ev.error !== "") {
              log.error(ev.error);
              reject(ev.error);
              return;
            }
            if (ev.data && returnedVerifier === this.verifier) {
              log.info(ev.data);
              const { access_token: accessToken } = verifierParameters;
              const userInfo = await get("https://graph.facebook.com/me?fields=name,email,picture.type(large)", {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              });
              const { name, id, picture, email } = userInfo || {};
              const pubKeyDetails = await this.handleLogin(this.verifier, id.toString(), { verifier_id: id.toString() }, accessToken);
              resolve({
                profileImage: picture.data.url,
                name,
                email,
                verifierId: id.toString(),
                verifier: this.verifier,
                publicAddress: pubKeyDetails.ethAddress,
                privateKey: pubKeyDetails.privKey
              });
            }
          } catch (error) {
            log.error(error);
            reject(error);
            return;
          } finally {
            bc.close();
            facebookWindow.close();
          }
        });
        facebookWindow.open();
        facebookWindow.once("close", () => {
          bc.close();
          reject(new Error("user closed popup"));
        });
      } else if (this.typeOfLogin === TWITCH) {
        const state = encodeURIComponent(
          window.btoa(
            JSON.stringify({
              instanceId: torus.instanceId,
              verifier: this.verifier
            })
          )
        );
        const claims = JSON.stringify({
          id_token: {
            email: null
          },
          userinfo: {
            picture: null,
            preferred_username: null
          }
        });
        const finalUrl =
          `https://id.twitch.tv/oauth2/authorize?client_id=${this.config.TWITCH_CLIENT_ID}&redirect_uri=` +
          `${this.config.redirect_uri}&response_type=token%20id_token&scope=user:read:email+openid&claims=${claims}&state=${state}`;
        const twitchWindow = new PopupHandler({ url: finalUrl });
        const bc = new BroadcastChannel(`redirect_channel_${torus.instanceId}`, broadcastChannelOptions);
        bc.addEventListener("message", async ev => {
          try {
            log.info(ev.data);
            const {
              instanceParams: { verifier: returnedVerifier },
              hashParams: verifierParameters
            } = ev.data || {};
            if (ev.error && ev.error !== "") {
              log.error(ev.error);
              reject(ev.error);
              return;
            }
            if (ev.data && returnedVerifier === this.verifier) {
              const { access_token: accessToken, id_token: idtoken } = verifierParameters;
              const userInfo = await get("https://id.twitch.tv/oauth2/userinfo", {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              });
              const tokenInfo = jwtDecode(idtoken);
              const { picture: profileImage, preferred_username: name } = userInfo || {};
              const { email } = tokenInfo || {};
              const pubKeyDetails = await this.handleLogin(
                this.verifier,
                userInfo.sub.toString(),
                { verifier_id: userInfo.sub.toString() },
                accessToken.toString()
              );
              resolve({
                profileImage,
                name,
                email,
                verifierId: userInfo.sub.toString(),
                verifier: this.verifier,
                publicAddress: pubKeyDetails.ethAddress,
                privateKey: pubKeyDetails.privKey
              });
            }
          } catch (error) {
            log.error(error);
            reject(error);
            return;
          } finally {
            bc.close();
            twitchWindow.close();
          }
        });
        twitchWindow.open();
        twitchWindow.once("close", () => {
          bc.close();
          reject(new Error("user closed popup"));
        });
      } else if (this.typeOfLogin === REDDIT) {
        const state = encodeURIComponent(
          window.btoa(
            JSON.stringify({
              instanceId: torus.instanceId,
              verifier: this.verifier
            })
          )
        );
        const finalUrl =
          `https://www.reddit.com/api/v1/authorize?client_id=${this.config.REDDIT_CLIENT_ID}&redirect_uri=` +
          `${this.config.redirect_uri}&response_type=token&scope=identity&state=${state}`;
        const redditWindow = new PopupHandler({ url: finalUrl });
        const bc = new BroadcastChannel(`redirect_channel_${torus.instanceId}`, broadcastChannelOptions);
        bc.addEventListener("message", async ev => {
          try {
            const {
              instanceParams: { verifier: returnedVerifier },
              hashParams: verifierParameters
            } = ev.data || {};
            log.info(ev.data);
            if (ev.error && ev.error !== "") {
              log.error(ev.error);
              reject(ev.error);
              return;
            }
            if (ev.data && returnedVerifier === this.verifier) {
              const { access_token: accessToken } = verifierParameters;
              const userInfo = await get("https://oauth.reddit.com/api/v1/me", {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              });
              const { icon_img: profileImage, name } = userInfo || {};
              const pubKeyDetails = await this.handleLogin(
                this.verifier,
                name.toString().toLowerCase(),
                { verifier_id: name.toString().toLowerCase() },
                accessToken
              );
              resolve({
                profileImage: profileImage.split("?").length > 0 ? profileImage.split("?")[0] : profileImage,
                name,
                email: "",
                verifierId: name.toString().toLowerCase(),
                verifier: this.verifier,
                publicAddress: pubKeyDetails.ethAddress,
                privateKey: pubKeyDetails.privKey
              });
            }
          } catch (error) {
            log.error(error);
            reject(error);
            return;
          } finally {
            bc.close();
            redditWindow.close();
          }
        });
        redditWindow.open();
        redditWindow.once("close", () => {
          bc.close();
          reject(new Error("user closed popup"));
        });
      } else if (this.typeOfLogin === DISCORD) {
        const state = encodeURIComponent(
          window.btoa(
            JSON.stringify({
              instanceId: torus.instanceId,
              verifier: this.verifier
            })
          )
        );
        const scope = encodeURIComponent("identify email");
        const finalUrl =
          `https://discordapp.com/api/oauth2/authorize?response_type=token&client_id=${this.config.DISCORD_CLIENT_ID}` +
          `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}`;
        const discordWindow = new PopupHandler({ url: finalUrl });
        const bc = new BroadcastChannel(`redirect_channel_${torus.instanceId}`, broadcastChannelOptions);
        bc.addEventListener("message", async ev => {
          try {
            const {
              instanceParams: { verifier: returnedVerifier },
              hashParams: verifierParameters
            } = ev.data || {};
            log.info(ev.data);
            if (ev.error && ev.error !== "") {
              log.error(ev.error);
              reject(ev.error);
              return;
            }
            if (ev.data && returnedVerifier === this.verifier) {
              const { access_token: accessToken } = verifierParameters;
              const userInfo = await get("https://discordapp.com/api/users/@me", {
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              });
              const { id, avatar, email, username: name, discriminator } = userInfo || {};
              const profileImage =
                avatar === null
                  ? `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`
                  : `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=2048`;
              const pubKeyDetails = await this.handleLogin(this.verifier, id.toString(), { verifier_id: id.toString() }, accessToken);
              resolve({
                profileImage,
                name: `${name}#${discriminator}`,
                email,
                verifierId: id.toString(),
                verifier: this.verifier,
                publicAddress: pubKeyDetails.ethAddress,
                privateKey: pubKeyDetails.privKey
              });
            }
          } catch (error) {
            log.error(error);
            reject(error);
            return;
          } finally {
            bc.close();
            discordWindow.close();
          }
        });
        discordWindow.open();
        discordWindow.once("close", () => {
          bc.close();
          reject(new Error("user closed popup"));
        });
      }
    });
  }

  async handleLogin(verifier, verifierId, verifierParams, idToken) {
    const { torusNodeEndpoints, torusNodePub, torusIndexes } = await this.nodeDetailManager.getNodeDetails();
    const response = await torus.getPublicAddress(torusNodeEndpoints, torusNodePub, { verifier, verifierId });
    log.info("New private key assigned to user at address ", response);
    const data = await torus.retrieveShares(torusNodeEndpoints, torusIndexes, verifier, verifierParams, idToken);
    log.info(data);
    return data;
  }
}

export default DirectWebSDK;
