import { get } from "@toruslabs/http-helpers";
import deepmerge from "lodash.merge";

import { LOGIN_TYPE, UX_MODE_TYPE } from "../utils/enums";
import log from "../utils/loglevel";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { Auth0ClientOptions, LoginWindowResponse, TorusGenericObject, TorusVerifierResponse, WebAuthnExtraParams } from "./interfaces";

const WEBAUTHN_LOOKUP_SERVER = "https://api.webauthn.openlogin.com";

export default class WebAuthnHandler extends AbstractLoginHandler {
  constructor(
    readonly clientId: string,
    readonly verifier: string,
    readonly redirect_uri: string,
    readonly typeOfLogin: LOGIN_TYPE,
    readonly uxMode: UX_MODE_TYPE,
    readonly redirectToOpener?: boolean,
    readonly jwtParams?: Auth0ClientOptions,
    readonly customState?: TorusGenericObject,
    readonly registerOnly?: boolean
  ) {
    super(clientId, verifier, redirect_uri, typeOfLogin, uxMode, redirectToOpener, jwtParams, customState);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const { webauthnURL } = this.customState || {};
    const finalUrl = webauthnURL ? new URL(webauthnURL) : new URL("https://webauthn.openlogin.com");
    const clonedParams = JSON.parse(JSON.stringify(this.jwtParams || {}));
    const finalJwtParams = deepmerge(
      {
        register_only: !!this.registerOnly,
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
    const { idToken, ref, extraParamsPassed, extraParams } = parameters;
    let verifierId: string;
    let signature: string;
    let clientDataJSON: string;
    let authenticatorData: string;
    let publicKey: string;
    let challenge: string;
    let rpOrigin: string;
    let credId: string;
    let transports: AuthenticatorTransport[];

    if (extraParamsPassed === "true") {
      log.debug("extraParamsPassed is true, using extraParams passed through hashParams");
      try {
        ({
          verifier_id: verifierId,
          signature,
          clientDataJSON,
          authenticatorData,
          publicKey,
          challenge,
          rpOrigin,
          credId,
          transports,
        } = JSON.parse(atob(extraParams)));
      } catch (error) {
        log.warn("unable to parse extraParams", error);
        ({
          verifier_id: verifierId,
          signature,
          clientDataJSON,
          authenticatorData,
          publicKey,
          challenge,
          rpOrigin,
          credId,
          transports,
        } = await get<WebAuthnExtraParams & { verifier_id: string }>(`${WEBAUTHN_LOOKUP_SERVER}/signature/fetch/${idToken}`));
      }
    } else {
      log.debug("extraParamsPassed is false, using extraParams passed through bridge server");
      ({
        verifier_id: verifierId,
        signature,
        clientDataJSON,
        authenticatorData,
        publicKey,
        challenge,
        rpOrigin,
        credId,
        transports,
      } = await get<WebAuthnExtraParams & { verifier_id: string }>(`${WEBAUTHN_LOOKUP_SERVER}/signature/fetch/${idToken}`));
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
      registerOnly: this.registerOnly,
      extraVerifierParams: {
        signature,
        clientDataJSON,
        authenticatorData,
        publicKey,
        challenge,
        rpOrigin,
        credId,
        transports,
      },
    };
  }
}
