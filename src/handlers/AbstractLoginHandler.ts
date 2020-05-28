import randomId from "@chaitanyapotti/random-id";
import { BroadcastChannel } from "broadcast-channel";

import log from "../utils/loglevel";
import PopupHandler from "../utils/PopupHandler";
import { ILoginHandler, LoginWindowResponse, TorusVerifierResponse } from "./interfaces";

const broadcastChannelOptions = {
  // type: 'localstorage', // (optional) enforce a type, oneOf['native', 'idb', 'localstorage', 'node']
  webWorkerSupport: false, // (optional) set this to false if you know that your channel will never be used in a WebWorker (increases performance)
};

type PopupResponse = { hashParams: { access_token: string; id_token?: string }; instanceParams: { verifier: string } };

export default abstract class AbstractLoginHandler implements ILoginHandler {
  protected nonce: string = randomId();

  protected finalURL: URL;

  constructor(readonly clientId: string, readonly verifier: string, readonly redirect_uri: string, readonly redirectToOpener?: boolean) {
    this.setFinalUrl();
  }

  get state(): string {
    return encodeURIComponent(
      window.btoa(
        JSON.stringify({
          instanceId: this.nonce,
          verifier: this.verifier,
          redirectToOpener: this.redirectToOpener || false,
        })
      )
    );
  }

  abstract getUserInfo(accessToken: string): Promise<TorusVerifierResponse>;

  abstract setFinalUrl(): void;

  handleLoginWindow(): Promise<LoginWindowResponse> {
    return new Promise<LoginWindowResponse>((resolve, reject) => {
      const handleData = (ev: { error: string; data: PopupResponse }) => {
        try {
          const { error, data } = ev;
          const {
            instanceParams: { verifier: returnedVerifier },
            hashParams: { access_token: accessToken, id_token: idToken },
          } = data || {};
          if (error) {
            log.error(ev.error);
            reject(new Error(error));
            return;
          }
          if (ev.data && returnedVerifier === this.verifier) {
            log.info(ev.data);
            resolve({ accessToken, idToken: idToken || "" });
          }
        } catch (error) {
          log.error(error);
          reject(error);
        }
      };
      const verifierWindow = new PopupHandler({ url: this.finalURL });
      let bc: BroadcastChannel;
      if (!this.redirectToOpener) {
        bc = new BroadcastChannel(`redirect_channel_${this.nonce}`, broadcastChannelOptions);
        bc.addEventListener("message", async (ev) => {
          handleData(ev);
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
}
