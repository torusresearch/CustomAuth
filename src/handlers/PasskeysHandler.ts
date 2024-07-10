import base64url from "base64url";
import deepmerge from "deepmerge";

import { LOGIN_TYPE, UX_MODE_TYPE } from "../utils/enums";
import { fetchDataFromBroadcastServer } from "../utils/sessionHelper";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { Auth0ClientOptions, LoginWindowResponse, PasskeySessionData, TorusGenericObject, TorusVerifierResponse } from "./interfaces";

export default class PasskeysHandler extends AbstractLoginHandler {
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
    if (!passkeysHostUrl) throw new Error("Invalid passkeys url.");
    const finalUrl = new URL(passkeysHostUrl);
    const clonedParams = JSON.parse(JSON.stringify(this.jwtParams || {}));
    const finalJwtParams = deepmerge(
      {
        state: this.state,
        client_id: this.clientId,
        redirect_uri: this.redirect_uri,
      },
      clonedParams
    );
    Object.keys(finalJwtParams).forEach((key: string) => {
      const localKey = key as keyof typeof finalJwtParams;
      if (finalJwtParams[localKey]) finalUrl.searchParams.append(localKey, finalJwtParams[localKey]);
    });
    this.finalURL = finalUrl;
  }

  async getUserInfo(parameters: LoginWindowResponse, storageServerUrl?: string): Promise<TorusVerifierResponse> {
    const { idToken, extraParams } = parameters;

    const { sessionId } = JSON.parse(base64url.decode(extraParams)) || {};
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
    } = await fetchDataFromBroadcastServer<PasskeySessionData>(sessionId, storageServerUrl);

    if (signature !== idToken) {
      throw new Error("idtoken should be equal to signature");
    }

    return {
      email: "",
      name: "Passkeys Login",
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
