import { TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { encodeBase64Url } from "@toruslabs/metadata-helpers";
import { describe, expect, it } from "vite-plus/test";

import TelegramHandler from "../../src/handlers/TelegramHandler";
import { AUTH_CONNECTION } from "../../src/utils/enums";
import type { CreateHandlerParams } from "../../src/utils/interfaces";

function makeHandler(): TelegramHandler {
  const params: CreateHandlerParams = {
    authConnection: AUTH_CONNECTION.TELEGRAM,
    clientId: "bot-id",
    authConnectionId: "telegram-verifier",
    redirect_uri: "https://example.com/redirect",
    web3AuthClientId: "web3auth-client-id",
    web3AuthNetwork: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
    storageServerUrl: "https://storage-server.example.com",
  };
  return new TelegramHandler(params);
}

describe("TelegramHandler.getUserInfo", () => {
  it("rejects a missing idToken with the Telegram helper message", async () => {
    const handler = makeHandler();
    await expect(handler.getUserInfo({ accessToken: "", state: {} })).rejects.toThrow("Telegram user id not found in idToken");
    await expect(handler.getUserInfo({ accessToken: "", idToken: "", state: {} })).rejects.toThrow("Telegram user id not found in idToken");
  });

  it("reads profile fields from a widget token", async () => {
    const handler = makeHandler();
    const idToken = encodeBase64Url(JSON.stringify({ id: 111, first_name: "Ada", last_name: "Lovelace", photo_url: "https://t.me/a.png" }));
    await expect(handler.getUserInfo({ accessToken: "", idToken, state: {} })).resolves.toMatchObject({
      name: "Ada Lovelace",
      profileImage: "https://t.me/a.png",
      userId: "111",
      authConnectionId: "telegram-verifier",
      authConnection: AUTH_CONNECTION.TELEGRAM,
    });
  });
});
