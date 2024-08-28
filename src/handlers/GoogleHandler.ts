import { get } from "@toruslabs/http-helpers";
import deepmerge from "deepmerge";

import AbstractLoginHandler from "./AbstractLoginHandler";
import { CreateHandlerParams, LoginWindowResponse, TorusVerifierResponse } from "./interfaces";

export default class GoogleHandler extends AbstractLoginHandler {
  private readonly RESPONSE_TYPE: string = "token id_token";

  private readonly SCOPE: string = "profile email openid";

  private readonly PROMPT: string = "select_account";

  constructor(params: CreateHandlerParams) {
    super(params);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const finalUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    const clonedParams = JSON.parse(JSON.stringify(this.params.jwtParams || {}));
    const finalJwtParams = deepmerge(
      {
        state: this.state,
        response_type: this.RESPONSE_TYPE,
        client_id: this.params.clientId,
        prompt: this.PROMPT,
        redirect_uri: this.params.redirect_uri,
        scope: this.SCOPE,
        nonce: this.nonce,
      },
      clonedParams
    );
    Object.keys(finalJwtParams).forEach((key: string) => {
      const localKey = key as keyof typeof finalJwtParams;
      if (finalJwtParams[localKey]) finalUrl.searchParams.append(localKey, finalJwtParams[localKey]);
    });
    this.finalURL = finalUrl;
  }

  async getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse> {
    const { accessToken } = params;
    const userInfo = await get<{ picture: string; email: string; name: string }>("https://www.googleapis.com/userinfo/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const { picture: profileImage = "", email = "", name = "" } = userInfo;
    return {
      email,
      name,
      profileImage,
      verifier: this.params.verifier,
      verifierId: email.toLowerCase(),
      typeOfLogin: this.params.typeOfLogin,
    };
  }
}
