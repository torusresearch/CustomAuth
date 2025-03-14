import base64url from "base64url";
import deepmerge from "deepmerge";

import { UX_MODE } from "../utils/enums";
import { getTimeout, objectToAuthDataMap, validateAndConstructUrl } from "../utils/helpers";
import { CreateHandlerParams, LoginWindowResponse, TorusConnectionResponse } from "../utils/interfaces";
import log from "../utils/loglevel";
import { PopupHandler } from "../utils/PopupHandler";
import AbstractLoginHandler from "./AbstractLoginHandler";

type PopupResponse = {
  result: {
    auth_date: number;
    first_name: string;
    hash: string;
    id: number;
    last_name: string;
    photo_url: string;
    username: string;
  };
  origin: string;
  event: string;
};

export default class TelegramHandler extends AbstractLoginHandler {
  private readonly RESPONSE_TYPE: string = "token";

  private readonly SCOPE: string = "profile";

  private readonly PROMPT: string = "select_account";

  constructor(params: CreateHandlerParams) {
    super(params);
    this.setFinalUrl();
  }

  setFinalUrl(): void {
    const { domain } = this.params.jwtParams;
    const finalUrl = validateAndConstructUrl(domain || "https://oauth.telegram.org/auth");

    const clonedParams = JSON.parse(JSON.stringify(this.params.jwtParams || {}));
    clonedParams.origin = `${this.params.redirect_uri}?state=${this.state}&nonce=${this.nonce}`;

    const finalJwtParams = deepmerge(
      {
        state: this.state,
        response_type: this.RESPONSE_TYPE,
        bot_id: this.params.clientId,
        prompt: this.PROMPT,
        redirect_uri: `${this.params.redirect_uri}?state=${this.state}&nonce=${this.nonce}`,
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

  async getUserInfo(params: LoginWindowResponse): Promise<TorusConnectionResponse> {
    const { idToken } = params;
    const userInfo = objectToAuthDataMap(idToken);
    const { photo_url: profileImage = "", first_name = "", last_name = "", id } = userInfo;
    return {
      email: "", // Telegram does not provide email
      name: `${first_name} ${last_name}`,
      profileImage,
      authConnectionId: this.params.authConnectionId,
      userId: id.toString(),
      authConnection: this.params.authConnection,
      groupedAuthConnectionId: this.params.groupedAuthConnectionId,
    };
  }

  async handleLoginWindow(params: { locationReplaceOnRedirect?: boolean; popupFeatures?: string }): Promise<LoginWindowResponse> {
    const authConnectionWindow = new PopupHandler({
      url: this.finalURL,
      features: params.popupFeatures,
      timeout: getTimeout(this.params.authConnection),
    });
    if (this.params.uxMode === UX_MODE.REDIRECT) {
      authConnectionWindow.redirect(params.locationReplaceOnRedirect);
    } else {
      return new Promise<LoginWindowResponse>((resolve, reject) => {
        const handleData = async (ev: string) => {
          try {
            const { event, origin, result, ...rest } = (JSON.parse(ev) as PopupResponse) || {};
            // 1. Parse URL
            const parsedUrl = new URL(origin);
            // 2. Get state param
            const stateParam = parsedUrl.searchParams.get("state");

            if (event && event === "auth_result") {
              // properly resolve the data
              resolve({
                accessToken: "",
                ...rest,
                idToken: base64url.encode(JSON.stringify(result)) || "",
                state: base64url.decode(stateParam) as unknown as { [key: string]: string },
              });
            }
          } catch (error) {
            log.error(error);
            reject(error);
          }
        };

        const postMessageEventHandler = async (postMessageEvent: MessageEvent) => {
          if (!postMessageEvent.data) {
            throw new Error("Invalid data received");
          }
          if (this.finalURL.origin !== postMessageEvent.origin) {
            throw new Error("Invalid origin received");
          }
          // make sure event is auth_result from telegram
          const ev = postMessageEvent.data;
          if (typeof ev != "string") {
            throw new Error("Invalid data type received");
          }
          const { event } = (JSON.parse(ev) as PopupResponse) || {};
          if (event && event !== "auth_result") {
            log.info("Invalid event received");
          }
          window.removeEventListener("message", postMessageEventHandler);
          handleData(ev);
          authConnectionWindow.close();
        };
        window.addEventListener("message", postMessageEventHandler);
        try {
          authConnectionWindow.open();
        } catch (error) {
          log.error(error);
          reject(error);
          return;
        }
        authConnectionWindow.once("close", () => {
          reject(new Error("user closed popup"));
        });
      });
    }
    return null;
  }
}
