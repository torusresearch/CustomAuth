import { TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import GoogleHandler from "../../src/handlers/GoogleHandler";
import { AUTH_CONNECTION } from "../../src/utils/enums";

describe("AbstractLoginHandler.handleLoginWindow with redirectToOpener", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ignores messages that do not come from the redirect_uri origin", async () => {
    const popup = { closed: false, focus() {}, close() {} };
    const listeners = new Map<string, (event: { data: unknown; origin: string }) => void>();
    vi.stubGlobal("window", {
      open: () => popup,
      innerWidth: 1200,
      innerHeight: 800,
      screenLeft: 0,
      screenTop: 0,
      addEventListener: (type: string, fn: (event: { data: unknown; origin: string }) => void) => listeners.set(type, fn),
      removeEventListener: (type: string) => listeners.delete(type),
    });

    const handler = new GoogleHandler({
      authConnection: AUTH_CONNECTION.GOOGLE,
      clientId: "google-client-id",
      authConnectionId: "google-verifier",
      redirect_uri: "https://app.example.com/serviceworker/redirect",
      redirectToOpener: true,
      web3AuthClientId: "web3auth-client-id",
      web3AuthNetwork: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
      storageServerUrl: "https://storage-server.example.com",
    });
    const pending = handler.handleLoginWindow({});
    await vi.waitFor(() => expect(listeners.has("message")).toBe(true));
    const onMessage = listeners.get("message")!;
    const message = (idToken: string) => ({
      channel: `redirect_channel_${handler.nonce}`,
      data: { instanceParams: { authConnectionId: "google-verifier" }, hashParams: { id_token: idToken } },
    });

    onMessage({ data: message("attacker_token"), origin: "https://evil.example.com" });
    expect(listeners.has("message")).toBe(true);

    onMessage({ data: message("real_token"), origin: "https://app.example.com" });
    await expect(pending).resolves.toMatchObject({ idToken: "real_token" });
  });
});
