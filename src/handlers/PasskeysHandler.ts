import base64url from "base64url";
import deepmerge from "lodash.merge";
import log from "loglevel";

import { LOGIN_TYPE, UX_MODE_TYPE } from "../utils/enums";
import { fetchDataFromBroadcastServer } from "../utils/sessionHelper";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { Auth0ClientOptions, LoginWindowResponse, PasskeySessionData, TorusGenericObject, TorusVerifierResponse } from "./interfaces";

export default class WebAuthnHandler extends AbstractLoginHandler {
  constructor(
    readonly clientId: string,
    readonly verifier: string,
    readonly redirect_uri: string,
    readonly typeOfLogin: LOGIN_TYPE,
    readonly uxMode: UX_MODE_TYPE,
    readonly redirectToOpener?: boolean,
    readonly jwtParams?: Auth0ClientOptions,
    readonly customState?: TorusGenericObject
  ) {
    super(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const { passkeysHostUrl } = this.customState || {};
    const finalUrl = passkeysHostUrl ? new URL(passkeysHostUrl) : new URL("https://passkeys.web3auth.io");
    const clonedParams = JSON.parse(JSON.stringify(this.jwtParams || {}));
    const finalJwtParams = deepmerge(
      {
        state: this.state,
        client_id: this.clientId,
        redirect_uri: this.redirect_uri,
      },
      clonedParams
    );
    Object.keys(finalJwtParams).forEach((key) => {
      if (finalJwtParams[key]) finalUrl.searchParams.append(key, finalJwtParams[key]);
    });
    log.info("final url", finalUrl);
    this.finalURL = finalUrl;
  }

  async getUserInfo(parameters: LoginWindowResponse): Promise<TorusVerifierResponse> {
    const { idToken, extraParams } = parameters;

    const { sessionId } = JSON.parse(base64url.decode(extraParams)) || {};
    log.info("sessionId", sessionId);
    if (!sessionId) {
      throw new Error("sessionId not found");
    }

    const {
      verifier_id: verifierId,
      signature,
      clientDataJSON,
      authenticatorData,
      publicKey,
      challenge,
      rpOrigin,
      rpId,
      credId,
      transports,
      username,
    } = await fetchDataFromBroadcastServer<PasskeySessionData>(sessionId);

    if (signature !== idToken) {
      throw new Error("idtoken should be equal to signature");
    }

    return {
      email: "",
      name: "WebAuthn Login",
      profileImage: "",
      verifier: this.verifier,
      verifierId,
      typeOfLogin: this.typeOfLogin,
      extraVerifierParams: {
        signature,
        clientDataJSON,
        authenticatorData,
        publicKey,
        challenge,
        rpOrigin,
        rpId,
        credId,
        transports,
        username,
      },
    };
  }
}
