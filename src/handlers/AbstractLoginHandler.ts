/* eslint-disable no-empty-function */
import randomId from "@chaitanyapotti/random-id";
import { BroadcastChannel } from "broadcast-channel";

import { LOGIN_TYPE, UX_MODE, UX_MODE_TYPE } from "../utils/enums";
import { broadcastChannelOptions } from "../utils/helpers";
import log from "../utils/loglevel";
import PopupHandler from "../utils/PopupHandler";
import { Auth0ClientOptions, ILoginHandler, LoginWindowResponse, PopupResponse, TorusVerifierResponse } from "./interfaces";

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
    readonly jwtParams?: Auth0ClientOptions
  ) {}

  get state(): string {
    return encodeURIComponent(
      window.btoa(
        JSON.stringify({
          instanceId: this.nonce,
          verifier: this.verifier,
          typeOfLogin: this.typeOfLogin,
          redirectToOpener: this.redirectToOpener || false,
        })
      )
    );
  }

  abstract getUserInfo(params: LoginWindowResponse): Promise<TorusVerifierResponse>;

  abstract setFinalUrl(): void;

  handleLoginWindow(): Promise<LoginWindowResponse> {
    const verifierWindow = new PopupHandler({ url: this.finalURL });
    if (this.uxMode === UX_MODE.POPUP) {
      return new Promise<LoginWindowResponse>((resolve, reject) => {
        let bc: BroadcastChannel;
        const handleData = async (ev: { error: string; data: PopupResponse }) => {
          try {
            const { error, data } = ev;
            const {
              instanceParams: { verifier: returnedVerifier },
              hashParams: { access_token: accessToken, id_token: idToken },
            } = data || {};
            if (error) {
              log.error(ev);
              reject(new Error(`Error: ${error}. Info: ${JSON.stringify(ev.data || {})}`));
              return;
            }
            if (ev.data && returnedVerifier === this.verifier) {
              log.info(ev.data);
              if (!this.redirectToOpener && bc) await bc.postMessage({ success: true });
              resolve({ accessToken, idToken: idToken || "" });
            }
          } catch (error) {
            log.error(error);
            reject(error);
          }
        };

        if (!this.redirectToOpener) {
          bc = new BroadcastChannel(`redirect_channel_${this.nonce}`, broadcastChannelOptions);
          bc.addEventListener("message", async (ev) => {
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
        verifierWindow.open();
        verifierWindow.once("close", () => {
          if (bc) bc.close();
          reject(new Error("user closed popup"));
        });
      });
    }
    if (this.uxMode === UX_MODE.REDIRECT) {
      verifierWindow.redirect();
    }
    return null;
  }
}

export default AbstractLoginHandler;
