import deepmerge from "deepmerge";
import jwtDecode from "jwt-decode";

import { LOGIN_TYPE, UX_MODE_TYPE } from "../utils/enums";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { Auth0ClientOptions, Auth0UserInfo, LoginWindowResponse, TorusGenericObject, TorusVerifierResponse } from "./interfaces";

export default class TorusPasswordlessHandler extends AbstractLoginHandler {
  private readonly SCOPE: string = "openid profile email";

  private readonly RESPONSE_TYPE: string = "token id_token";

  private readonly PROMPT: string = "login";

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
    const clonedParams = JSON.parse(JSON.stringify(this.jwtParams || {}));
    const { connection = "email", login_hint, domain } = this.jwtParams;
    const finalUrl = new URL(domain);
    const finalJwtParams = deepmerge(
      {
        state: this.state,
        response_type: this.RESPONSE_TYPE,
        client_id: this.clientId,
        email: connection === "email" ? login_hint : undefined,
        phone_number: connection === "sms" ? login_hint : undefined,
        prompt: this.PROMPT,
        redirect_uri: this.redirect_uri,
        scope: this.SCOPE,
        nonce: this.nonce,
      },
      clonedParams
    );
    Object.keys(finalJwtParams).forEach((key) => {
      if (finalJwtParams[key]) finalUrl.searchParams.append(key, finalJwtParams[key]);
    });
    this.finalURL = finalUrl;
  }

  async getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse> {
    const { idToken } = params;
    const decodedToken = jwtDecode(idToken) as Auth0UserInfo;
    const { name, email, picture } = decodedToken;
    return {
      profileImage: picture || "",
      name,
      email,
      verifierId: email,
      verifier: this.verifier,
      typeOfLogin: this.typeOfLogin,
    };
  }
}
