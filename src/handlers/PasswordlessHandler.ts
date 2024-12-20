import { get, post } from "@toruslabs/http-helpers";
import deepmerge from "deepmerge";

import { broadcastChannelOptions, decodeToken, getVerifierId, padUrlString, validateAndConstructUrl } from "../utils/helpers";
import log from "../utils/loglevel";
import AbstractLoginHandler from "./AbstractLoginHandler";
import { Auth0UserInfo, CreateHandlerParams, LoginWindowResponse, PopupResponse, TorusVerifierResponse } from "./interfaces";

export default class PasswordlessHandler extends AbstractLoginHandler {
  private readonly SCOPE: string = "openid profile email";

  private readonly RESPONSE_TYPE: string = "token id_token";

  private readonly PROMPT: string = "login";

  constructor(params: CreateHandlerParams) {
    super(params);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const { domain } = this.params.jwtParams;
    const domainUrl = validateAndConstructUrl(domain);

    domainUrl.pathname = "/passwordless/start";
    this.finalURL = domainUrl;
  }

  async getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse> {
    const { idToken, accessToken } = params;
    const { domain, verifierIdField, isVerifierIdCaseSensitive } = this.params.jwtParams;
    try {
      const domainUrl = new URL(domain);
      const userInfo = await get<Auth0UserInfo>(`${padUrlString(domainUrl)}userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { picture, name, email } = userInfo;
      return {
        email,
        name,
        profileImage: picture,
        verifierId: getVerifierId(userInfo, this.params.typeOfLogin, verifierIdField, isVerifierIdCaseSensitive),
        verifier: this.params.verifier,
        typeOfLogin: this.params.typeOfLogin,
      };
    } catch (error) {
      log.error(error);
      const decodedToken = decodeToken<Auth0UserInfo>(idToken).payload;
      const { name, email, picture } = decodedToken;
      return {
        profileImage: picture,
        name,
        email,
        verifierId: getVerifierId(decodedToken, this.params.typeOfLogin, verifierIdField, isVerifierIdCaseSensitive),
        verifier: this.params.verifier,
        typeOfLogin: this.params.typeOfLogin,
      };
    }
  }

  async handleLoginWindow(): Promise<LoginWindowResponse> {
    const { BroadcastChannel } = await import("@toruslabs/broadcast-channel");
    return new Promise<LoginWindowResponse>((resolve, reject) => {
      if (this.params.redirectToOpener) {
        reject(new Error("Cannot use redirect to opener for passwordless"));
        return;
      }
      const handleData = (ev: { error: string; data: PopupResponse }) => {
        try {
          const { error, data } = ev;
          const {
            instanceParams,
            hashParams: { access_token: accessToken, id_token: idToken, ...rest },
          } = data || {};
          if (error) {
            log.error(ev.error);
            reject(new Error(error));
            return;
          }
          if (ev.data && instanceParams.verifier === this.params.verifier) {
            log.info(ev.data);
            resolve({ accessToken, idToken: idToken || "", ...rest, state: instanceParams });
          }
        } catch (error) {
          log.error(error);
          reject(error);
        }
      };
      const bc = new BroadcastChannel<{
        error: string;
        data: PopupResponse;
      }>(`redirect_channel_${this.nonce}`, broadcastChannelOptions);
      bc.addEventListener("message", async (ev) => {
        handleData(ev);
        bc.close();
      });
      try {
        const { connection = "email", login_hint } = this.params.jwtParams;
        const finalJwtParams = deepmerge(
          {
            client_id: this.params.clientId,
            connection,
            email: connection === "email" ? login_hint : undefined,
            phone_number: connection === "sms" ? login_hint : undefined,
            send: "link",
            authParams: {
              scope: this.SCOPE,
              state: this.state,
              response_type: this.RESPONSE_TYPE,
              redirect_uri: this.params.redirect_uri,
              nonce: this.nonce,
              prompt: this.PROMPT,
            },
          },
          {
            authParams: this.params.jwtParams,
          }
        );
        // using stringify and parse to remove undefined params
        // This method is only resolved when the user clicks the email link
        post(this.finalURL.href, JSON.parse(JSON.stringify(finalJwtParams)))
          .then((response) => {
            log.info("posted", response);
            return undefined;
          })
          .catch((error) => {
            log.error(error);
            reject(error);
          });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }
}
