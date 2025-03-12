import base64url from "base64url";
import deepmerge from "deepmerge";

import { CreateHandlerParams, LoginWindowResponse, PasskeySessionData, TorusVerifierResponse } from "../utils/interfaces";
import { fetchDataFromBroadcastServer } from "../utils/sessionHelper";
import AbstractLoginHandler from "./AbstractLoginHandler";

export default class PasskeysHandler extends AbstractLoginHandler {
  constructor(params: CreateHandlerParams) {
    super(params);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const { passkeysHostUrl } = this.params.customState || {};
    if (!passkeysHostUrl) throw new Error("Invalid passkeys url.");
    const finalUrl = new URL(passkeysHostUrl);
    const clonedParams = JSON.parse(JSON.stringify(this.params.jwtParams || {}));
    const finalJwtParams = deepmerge(
      {
        state: this.state,
        client_id: this.params.clientId,
        redirect_uri: this.params.redirect_uri,
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
      verifier: this.params.verifier,
      verifierId,
      typeOfLogin: this.params.typeOfLogin,
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
