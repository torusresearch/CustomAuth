import { get } from "@toruslabs/http-helpers";
import deepmerge from "deepmerge";

import { CreateHandlerParams, LoginWindowResponse, TorusVerifierResponse } from "../utils/interfaces";
import AbstractLoginHandler from "./AbstractLoginHandler";

export default class FacebookHandler extends AbstractLoginHandler {
  private readonly RESPONSE_TYPE: string = "token";

  private readonly SCOPE: string = "public_profile email";

  constructor(params: CreateHandlerParams) {
    super(params);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const finalUrl = new URL("https://www.facebook.com/v20.0/dialog/oauth");
    const clonedParams = JSON.parse(JSON.stringify(this.params.jwtParams || {}));
    const finalJwtParams = deepmerge(
      {
        state: this.state,
        response_type: this.RESPONSE_TYPE,
        client_id: this.params.clientId,
        redirect_uri: this.params.redirect_uri,
        scope: this.SCOPE,
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
    const userInfo = await get<{ name: string; id: string; picture: { data: { url?: string } }; email?: string }>(
      "https://graph.facebook.com/me?fields=name,email,picture.type(large)",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const { name = "", id, picture, email = "" } = userInfo;
    return {
      email,
      name,
      profileImage: picture.data.url || "",
      verifier: this.params.verifier,
      verifierId: id,
      typeOfLogin: this.params.typeOfLogin,
    };
  }
}
