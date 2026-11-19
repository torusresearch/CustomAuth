import { decodeToken, deepmerge } from "../utils/helpers";
import { CreateHandlerParams, LoginWindowResponse, TorusConnectionResponse } from "../utils/interfaces";
import AbstractLoginHandler from "./AbstractLoginHandler";

export default class FacebookHandler extends AbstractLoginHandler {
  private readonly RESPONSE_TYPE: string = "id_token";

  private readonly SCOPE: string = "openid email";

  constructor(params: CreateHandlerParams) {
    super(params);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const finalUrl = new URL("https://www.facebook.com/v27.0/dialog/oauth");
    const clonedParams = JSON.parse(JSON.stringify(this.params.jwtParams || {}));
    const finalJwtParams = deepmerge(
      {
        client_id: this.params.clientId,
        redirect_uri: this.params.redirect_uri,
        scope: this.SCOPE,
      },
      clonedParams
    );
    // jwtParams must not change the flow: the nodes accept only the id_token, and getUserInfo checks its nonce.
    finalJwtParams.state = this.state;
    finalJwtParams.response_type = this.RESPONSE_TYPE;
    finalJwtParams.nonce = this.nonce;
    const scopes = String(finalJwtParams.scope || "")
      .split(/[\s,]+/)
      .filter(Boolean);
    if (!scopes.includes("openid")) scopes.unshift("openid");
    finalJwtParams.scope = scopes.join(" ");
    Object.keys(finalJwtParams).forEach((key: string) => {
      const localKey = key as keyof typeof finalJwtParams;
      if (finalJwtParams[localKey]) finalUrl.searchParams.append(key, finalJwtParams[localKey]);
    });
    this.finalURL = finalUrl;
  }

  async getUserInfo(params: LoginWindowResponse): Promise<TorusConnectionResponse> {
    const { idToken, state } = params;
    // triggerLogin sends `idToken || accessToken` to the nodes, so a missing id_token must stop the login here.
    if (!idToken) throw new Error("Facebook login did not return an id_token");
    let claims: { nonce?: unknown; sub?: string; name?: string; email?: string; picture?: string };
    try {
      claims = decodeToken<typeof claims>(idToken).payload;
    } catch {
      throw new Error("Facebook login returned an id_token that is not a JWT");
    }
    const { nonce, sub, name = "", email = "", picture = "" } = claims;
    if (!nonce || nonce !== state?.instanceId) throw new Error("Facebook id_token nonce mismatch");
    if (!sub) throw new Error("Facebook id_token has no sub");
    return {
      email,
      name,
      profileImage: picture,
      authConnectionId: this.params.authConnectionId,
      authConnection: this.params.authConnection,
      groupedAuthConnectionId: this.params.groupedAuthConnectionId,
      userId: sub,
    };
  }
}
