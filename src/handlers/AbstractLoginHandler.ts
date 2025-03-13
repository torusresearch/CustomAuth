import base64url from "base64url";

import { UX_MODE } from "../utils/enums";
import { broadcastChannelOptions, getTimeout, randomId } from "../utils/helpers";
import { CreateHandlerParams, ILoginHandler, LoginWindowResponse, PopupResponse, TorusConnectionResponse } from "../utils/interfaces";
import log from "../utils/loglevel";
import { PopupHandler } from "../utils/PopupHandler";

abstract class AbstractLoginHandler implements ILoginHandler {
  public nonce: string = randomId();

  public finalURL: URL;

  public params: CreateHandlerParams;

  // Not using object constructor because of this issue
  // https://github.com/microsoft/TypeScript/issues/5326
  constructor(params: CreateHandlerParams) {
    this.params = params;
  }

  get state(): string {
    return encodeURIComponent(
      base64url.encode(
        JSON.stringify({
          ...(this.params.customState || {}),
          instanceId: this.nonce,
          authConnectionId: this.params.authConnectionId,
          authConnection: this.params.authConnection,
          groupedAuthConnectionId: this.params.groupedAuthConnectionId,
          redirectToOpener: this.params.redirectToOpener || false,
        })
      )
    );
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
      const { RedundantAdaptiveBroadcastChannel: BroadcastChannel } = await import("@toruslabs/broadcast-channel");
      return new Promise<LoginWindowResponse>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let bc: any;
        const handleData = async (ev: { error: string; data: PopupResponse }) => {
          try {
            const { error, data } = ev;
            const {
              instanceParams,
              hashParams: { access_token: accessToken, id_token: idToken, ...rest },
            } = data || {};
            if (error) {
              log.error(ev);
              reject(new Error(`Error: ${error}. Info: ${JSON.stringify(ev.data || {})}`));
              return;
            }
            if (ev.data && instanceParams.authConnectionId === this.params.authConnectionId) {
              log.info(ev.data);
              if (!this.params.redirectToOpener && bc) await bc.postMessage({ success: true });
              resolve({
                accessToken,
                idToken: idToken || "",
                ...rest,
                // State has to be last here otherwise it will be overwritten
                state: instanceParams,
              });
            }
          } catch (error) {
            log.error(error);
            reject(error);
          }
        };

        if (!this.params.redirectToOpener) {
          bc = new BroadcastChannel<{
            error: string;
            data: PopupResponse;
          }>(`redirect_channel_${this.nonce}`, broadcastChannelOptions);
          bc.addEventListener("message", async (ev: { error: string; data: PopupResponse }) => {
            await handleData(ev);
            bc.close();
            authConnectionWindow.close();
          });
        } else {
          const postMessageEventHandler = async (postMessageEvent: MessageEvent) => {
            if (!postMessageEvent.data) return;
            const ev = postMessageEvent.data;
            if (ev.channel !== `redirect_channel_${this.nonce}`) return;
            window.removeEventListener("message", postMessageEventHandler);
            handleData(ev);
            authConnectionWindow.close();
          };
          window.addEventListener("message", postMessageEventHandler);
        }
        try {
          authConnectionWindow.open();
        } catch (error) {
          log.error(error);
          reject(error);
          return;
        }
        authConnectionWindow.once("close", () => {
          if (bc) bc.close();
          reject(new Error("user closed popup"));
        });
      });
    }
    return null;
  }

  abstract getUserInfo(params: LoginWindowResponse): Promise<TorusConnectionResponse>;

  abstract setFinalUrl(): void;
}

export default AbstractLoginHandler;
