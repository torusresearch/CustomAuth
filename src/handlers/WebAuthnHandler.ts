import deepmerge from "deepmerge";

import { LOGIN_TYPE, UX_MODE_TYPE } from "../utils/enums";
import { get } from "../utils/httpHelpers";
import log from "../utils/loglevel";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { Auth0ClientOptions, LoginWindowResponse, TorusVerifierResponse } from "./interfaces";

export default class WebAuthnHandler extends AbstractLoginHandler {
  constructor(
    readonly clientId: string,
    readonly verifier: string,
    readonly redirect_uri: string,
    readonly typeOfLogin: LOGIN_TYPE,
    readonly uxMode: UX_MODE_TYPE,
    readonly redirectToOpener?: boolean,
    readonly jwtParams?: Auth0ClientOptions
  ) {
    super(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const finalUrl = new URL("https://afternoon-caverns-12426.herokuapp.com");
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
    this.finalURL = finalUrl;
  }

  async getUserInfo(parameters: LoginWindowResponse): Promise<TorusVerifierResponse> {
    const { idToken, ref, extraParams, extraParamsPassed } = parameters;
    let verifierId: string;
    let signature: string;
    let clientDataJSON: string;
    let authenticatorData: string;
    let publicKey: string;
    let challenge: string;
    let rpOrigin: string;

    if (extraParamsPassed === "true") {
      log.debug("extraParamsPassed is true, using extraParams passed through hashParams");
      ({ verifier_id: verifierId, signature, clientDataJSON, authenticatorData, publicKey, challenge, rpOrigin } = JSON.parse(atob(extraParams)));
    } else {
      log.debug("extraParamsPassed is false, using extraParams passed through bridge server");
      ({ verifier_id: verifierId, signature, clientDataJSON, authenticatorData, publicKey, challenge, rpOrigin } = await get(
        `https://webauthn.lookup.dev.tor.us/fetch/${idToken}`
      ));
    }

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
      ref,
      extraVerifierParams: {
        signature,
        clientDataJSON,
        authenticatorData,
        publicKey,
        challenge,
        rpOrigin,
      },
    };
  }
}
