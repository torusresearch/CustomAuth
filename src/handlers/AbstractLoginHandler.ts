import base64url from "base64url";

import { LOGIN_TYPE, UX_MODE, UX_MODE_TYPE } from "../utils/enums";
import { broadcastChannelOptions, getTimeout, randomId } from "../utils/helpers";
import log from "../utils/loglevel";
import PopupHandler from "../utils/PopupHandler";
import { Auth0ClientOptions, ILoginHandler, LoginWindowResponse, PopupResponse, TorusGenericObject, TorusVerifierResponse } from "./interfaces";

abstract class AbstractLoginHandler implements ILoginHandler {
  public nonce: string = randomId();

  public finalURL: URL;

  // Not using object constructor because of this issue
  // https://github.com/microsoft/TypeScript/issues/5326
  constructor(
    readonly clientId: string,
    readonly verifier: string,
    readonly redirect_uri: string,
    readonly typeOfLogin: LOGIN_TYPE,
    readonly uxMode: UX_MODE_TYPE,
    readonly redirectToOpener?: boolean,
    readonly jwtParams?: Auth0ClientOptions,
    readonly customState?: TorusGenericObject
  ) {}

  get state(): string {
    return encodeURIComponent(
      base64url.encode(
        JSON.stringify({
          ...(this.customState || {}),
          instanceId: this.nonce,
          verifier: this.verifier,
          typeOfLogin: this.typeOfLogin,
          redirectToOpener: this.redirectToOpener || false,
        })
      )
    );
  }

  async handleLoginWindow(params: { locationReplaceOnRedirect?: boolean; popupFeatures?: string }): Promise<LoginWindowResponse> {
    const verifierWindow = new PopupHandler({ url: this.finalURL, features: params.popupFeatures, timeout: getTimeout(this.typeOfLogin) });
    if (this.uxMode === UX_MODE.REDIRECT) {
      verifierWindow.redirect(params.locationReplaceOnRedirect);
    } else {
      const { BroadcastChannel } = await import("@toruslabs/broadcast-channel");
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
            if (ev.data && instanceParams.verifier === this.verifier) {
              log.info(ev.data);
              if (!this.redirectToOpener && bc) await bc.postMessage({ success: true });
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

        if (!this.redirectToOpener) {
          bc = new BroadcastChannel<{
            error: string;
            data: PopupResponse;
          }>(`redirect_channel_${this.nonce}`, broadcastChannelOptions);
          bc.addEventListener("message", async (ev: { error: string; data: PopupResponse }) => {
            await handleData(ev);
            bc.close();
            verifierWindow.close();
          });
        } else {
          const postMessageEventHandler = async (postMessageEvent: MessageEvent) => {
            if (!postMessageEvent.data) return;
            const ev = postMessageEvent.data;
            if (ev.channel !== `redirect_channel_${this.nonce}`) return;
            window.removeEventListener("message", postMessageEventHandler);
            handleData(ev);
            verifierWindow.close();
          };
          window.addEventListener("message", postMessageEventHandler);
        }
        try {
          verifierWindow.open();
        } catch (error) {
          log.error(error);
          reject(error);
          return;
        }
        verifierWindow.once("close", () => {
          if (bc) bc.close();
          reject(new Error("user closed popup"));
        });
      });
    }
    return null;
  }

  abstract getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse>;

  abstract setFinalUrl(): void;
}

export default AbstractLoginHandler;
