import { get } from "@toruslabs/http-helpers";
import deepmerge from "deepmerge";

import { CreateHandlerParams, LoginWindowResponse, TorusConnectionResponse } from "../utils/interfaces";
import AbstractLoginHandler from "./AbstractLoginHandler";

export default class TwitchHandler extends AbstractLoginHandler {
  private readonly RESPONSE_TYPE: string = "token";

  private readonly SCOPE: string = "user:read:email";

  constructor(params: CreateHandlerParams) {
    super(params);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const finalUrl = new URL("https://id.twitch.tv/oauth2/authorize");
    const clonedParams = JSON.parse(JSON.stringify(this.params.jwtParams || {}));
    const finalJwtParams = deepmerge(
      {
        state: this.state,
        response_type: this.RESPONSE_TYPE,
        client_id: this.params.clientId,
        redirect_uri: this.params.redirect_uri,
        scope: this.SCOPE,
        force_verify: "true",
      },
      clonedParams
    );
    Object.keys(finalJwtParams).forEach((key: string) => {
      const localKey = key as keyof typeof finalJwtParams;
      if (finalJwtParams[localKey]) finalUrl.searchParams.append(localKey, finalJwtParams[localKey]);
    });
    this.finalURL = finalUrl;
  }

  async getUserInfo(params: LoginWindowResponse): Promise<TorusConnectionResponse> {
    const { accessToken } = params;
    const userInfo = await get<{ data: [{ profile_image_url: string; display_name: string; email: string; id: string }] }>(
      "https://api.twitch.tv/helix/users",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-ID": this.params.clientId,
        },
      }
    );
    const [{ profile_image_url: profileImage = "", display_name: name = "", email = "", id: userId }] = userInfo.data || [];
    return {
      profileImage,
      name,
      email,
      userId: userId,
      authConnectionId: this.params.authConnectionId,
      authConnection: this.params.authConnection,
      groupedAuthConnectionId: this.params.groupedAuthConnectionId,
    };
  }
}
