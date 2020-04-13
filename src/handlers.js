import { BroadcastChannel } from "broadcast-channel";
import log from "loglevel";

import { get, remove } from "./utils/httpHelpers";
import PopupHandler from "./utils/PopupHandler";

const broadcastChannelOptions = {
  // type: 'localstorage', // (optional) enforce a type, oneOf['native', 'idb', 'localstorage', 'node']
  webWorkerSupport: false, // (optional) set this to false if you know that your channel will never be used in a WebWorker (increases performance)
};

export async function googleHandler(verifier, verifierParameters) {
  const { access_token: accessToken, id_token: idToken } = verifierParameters;
  const userInfo = await get("https://www.googleapis.com/userinfo/v2/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const { picture: profileImage, email, name } = userInfo || {};
  const pubKeyDetails = await this.handleLogin(verifier, email.toString().toLowerCase(), { verifier_id: email.toString().toLowerCase() }, idToken);
  return {
    profileImage,
    name,
    email,
    verifierId: email.toString().toLowerCase(),
    verifier,
    publicAddress: pubKeyDetails.ethAddress,
    privateKey: pubKeyDetails.privKey,
  };
}

export async function facebookHandler(verifier, verifierParameters) {
  const { access_token: accessToken } = verifierParameters;
  const userInfo = await get("https://graph.facebook.com/me?fields=name,email,picture.type(large)", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const { name, id, picture, email } = userInfo || {};
  const pubKeyDetails = await this.handleLogin(verifier, id.toString(), { verifier_id: id.toString() }, accessToken);
  remove(`https://graph.facebook.com/me/permissions?access_token=${accessToken}`)
    .then((resp) => log.info(resp))
    .catch((error) => log.error(error));
  return {
    profileImage: picture.data.url,
    name,
    email,
    verifierId: id.toString(),
    verifier,
    publicAddress: pubKeyDetails.ethAddress,
    privateKey: pubKeyDetails.privKey,
  };
}

export async function twitchHandler(verifier, verifierParameters) {
  const { access_token: accessToken } = verifierParameters;
  const userInfo = await get("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const [{ profile_image_url: profileImage, display_name: name, email, id: verifierId }] = userInfo.data || {};
  const pubKeyDetails = await this.handleLogin(verifier, verifierId, { verifier_id: verifierId }, accessToken.toString());
  return {
    profileImage,
    name,
    email,
    verifierId,
    verifier,
    publicAddress: pubKeyDetails.ethAddress,
    privateKey: pubKeyDetails.privKey,
  };
}

export async function redditHandler(verifier, verifierParameters) {
  const { access_token: accessToken } = verifierParameters;
  const userInfo = await get("https://oauth.reddit.com/api/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const { icon_img: profileImage, name } = userInfo || {};
  const pubKeyDetails = await this.handleLogin(verifier, name.toString().toLowerCase(), { verifier_id: name.toString().toLowerCase() }, accessToken);
  return {
    profileImage: profileImage.split("?").length > 0 ? profileImage.split("?")[0] : profileImage,
    name,
    email: "",
    verifierId: name.toString().toLowerCase(),
    verifier,
    publicAddress: pubKeyDetails.ethAddress,
    privateKey: pubKeyDetails.privKey,
  };
}

export async function discordHandler(verifier, verifierParameters) {
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
  return {
    profileImage,
    name: `${name}#${discriminator}`,
    email,
    verifierId: id.toString(),
    verifier,
    publicAddress: pubKeyDetails.ethAddress,
    privateKey: pubKeyDetails.privKey,
  };
}

export const handleLoginWindow = (verifier, redirectToOpener, resolve, reject) => {
  async function handleData(ev, handler) {
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
        const loginDetails = await handler(verifier, verifierParameters);
        resolve(loginDetails);
      }
    } catch (error) {
      log.error(error);
      reject(error);
    }
  }
  return function handleWindow(url, handler) {
    const verifierWindow = new PopupHandler({ url });
    let bc;
    if (!redirectToOpener) {
      bc = new BroadcastChannel(`redirect_channel_${this.torus.instanceId}`, broadcastChannelOptions);
      bc.addEventListener("message", async (ev) => {
        await handleData(ev, handler.bind(this));
        bc.close();
        verifierWindow.close();
      });
    } else {
      window.addEventListener("message", async (postMessageEvent) => {
        if (!postMessageEvent.data) return;
        const ev = postMessageEvent.data;
        if (ev.channel !== `redirect_channel_${this.torus.instanceId}`) return;
        await handleData(ev, handler.bind(this));
        verifierWindow.close();
      });
    }
    verifierWindow.open();
    verifierWindow.once("close", () => {
      if (bc) bc.close();
      reject(new Error("user closed popup"));
    });
  };
};
