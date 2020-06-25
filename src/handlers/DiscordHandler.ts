import { LOGIN_TYPE } from "../utils/enums";
import { get } from "../utils/httpHelpers";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { LoginWindowResponse, TorusVerifierResponse } from "./interfaces";

export default class DiscordHandler extends AbstractLoginHandler {
  private readonly RESPONSE_TYPE: string = "token";

  private readonly SCOPE: string = "identify email";

  constructor(
    readonly clientId: string,
    readonly verifier: string,
    readonly redirect_uri: string,
    readonly typeOfLogin: LOGIN_TYPE,
    redirectToOpener?: boolean
  ) {
    super(clientId, verifier, redirect_uri, redirectToOpener);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const finalUrl = new URL("https://discordapp.com/api/oauth2/authorize");
    finalUrl.searchParams.append("response_type", this.RESPONSE_TYPE);
    finalUrl.searchParams.append("client_id", this.clientId);
    finalUrl.searchParams.append("state", this.state);
    finalUrl.searchParams.append("scope", this.SCOPE);
    finalUrl.searchParams.append("redirect_uri", this.redirect_uri);
    this.finalURL = finalUrl;
  }

  async getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse> {
    const { accessToken } = params;
    const userInfo = await get<{ id: string; username: string; discriminator: string; avatar?: string; email?: string }>(
      "https://discordapp.com/api/users/@me",
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
      verifierId: id,
      verifier: this.verifier,
      typeOfLogin: this.typeOfLogin,
    };
  }
}
