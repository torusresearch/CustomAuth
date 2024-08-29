import deepmerge from "deepmerge";

import { decodeToken, loginToConnectionMap } from "../utils/helpers";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { Auth0UserInfo, CreateHandlerParams, EMAIL_FLOW, LoginWindowResponse, TorusVerifierResponse } from "./interfaces";

export default class Web3AuthPasswordlessHandler extends AbstractLoginHandler {
  private readonly SCOPE: string = "openid profile email";

  private readonly RESPONSE_TYPE: string = "token id_token";

  private readonly PROMPT: string = "login";

  constructor(params: CreateHandlerParams) {
    super(params);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const finalUrl = new URL("https://passwordless.web3auth.io/v6/authorize");
    const clonedParams = JSON.parse(JSON.stringify(this.params.jwtParams || {}));
    this.params.customState = { ...(this.params.customState || {}), client: this.params.web3AuthClientId };
    const finalJwtParams = deepmerge(
      {
        state: this.state,
        client_id: this.params.clientId || this.params.web3AuthClientId,
        redirect_uri: this.params.redirect_uri,
        nonce: this.nonce,
        network: this.params.web3AuthNetwork,
        connection: loginToConnectionMap[this.params.typeOfLogin],
        web3auth_client_id: this.params.web3AuthClientId,
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
      verifierId: name.toLowerCase(),
      verifier: this.params.verifier,
      typeOfLogin: this.params.typeOfLogin,
    };
  }
}
