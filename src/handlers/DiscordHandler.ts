import { get } from "@toruslabs/http-helpers";
import deepmerge from "deepmerge";

import { CreateHandlerParams, LoginWindowResponse, TorusConnectionResponse } from "../utils/interfaces";
import AbstractLoginHandler from "./AbstractLoginHandler";

export default class DiscordHandler extends AbstractLoginHandler {
  private readonly RESPONSE_TYPE: string = "token";

  private readonly SCOPE: string = "identify email";

  constructor(params: CreateHandlerParams) {
    super(params);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const finalUrl = new URL("https://discord.com/api/oauth2/authorize");
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

  async getUserInfo(params: LoginWindowResponse): Promise<TorusConnectionResponse> {
    const { accessToken } = params;
    const userInfo = await get<{ id: string; username: string; discriminator: string; avatar?: string; email?: string }>(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const { id, avatar, email = "", username: name = "", discriminator = "" } = userInfo;
    const profileImage =
      avatar === null
        ? `https://cdn.discordapp.com/embed/avatars/${Number(discriminator) % 5}.png`
        : `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=2048`;
    return {
      profileImage,
      name: `${name}#${discriminator}`,
      email,
      userId: id,
      authConnectionId: this.params.authConnectionId,
      authConnection: this.params.authConnection,
    };
  }
}
