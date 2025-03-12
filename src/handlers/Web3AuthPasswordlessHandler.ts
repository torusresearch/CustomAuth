import deepmerge from "deepmerge";

import { decodeToken, loginToConnectionMap, validateAndConstructUrl } from "../utils/helpers";
import { Auth0UserInfo, CreateHandlerParams, EMAIL_FLOW, LoginWindowResponse, TorusVerifierResponse } from "../utils/interfaces";
import AbstractLoginHandler from "./AbstractLoginHandler";

export default class Web3AuthPasswordlessHandler extends AbstractLoginHandler {
  private readonly SCOPE: string = "openid profile email";

  private readonly RESPONSE_TYPE: string = "token id_token";

  private readonly PROMPT: string = "login";

  constructor(params: CreateHandlerParams) {
    super(params);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const { domain } = this.params.jwtParams || {};
    const finalUrl = validateAndConstructUrl(domain || "https://passwordless.web3auth.io/v6");
    finalUrl.pathname += finalUrl.pathname.endsWith("/") ? "authorize" : "/authorize";
    const clonedParams = JSON.parse(JSON.stringify(this.params.jwtParams || {}));
    delete clonedParams.domain;
    this.params.customState = { ...(this.params.customState || {}), client: this.params.web3AuthClientId };
    const finalJwtParams = deepmerge(
      {
        state: this.state,
        client_id: this.params.clientId || this.params.web3AuthClientId,
        redirect_uri: this.params.redirect_uri,
        nonce: this.nonce,
        network: this.params.web3AuthNetwork,
        connection: loginToConnectionMap[this.params.authConnection],
        scope: this.SCOPE,
        response_type: this.RESPONSE_TYPE,
        prompt: this.PROMPT,
        flow_type: clonedParams?.flow_type || EMAIL_FLOW.code,
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
    const { idToken } = params;

    const decodedToken = decodeToken<Auth0UserInfo>(idToken).payload;
    const { name, email, picture } = decodedToken;
    return {
      profileImage: picture,
      name,
      email,
      userId: name.toLowerCase(),
      authConnectionId: this.params.authConnectionId,
      authConnection: this.params.authConnection,
    };
  }
}
