import { TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { decodeBase64Url, encodeBase64Url } from "@toruslabs/metadata-helpers";
import { describe, expect, it } from "vite-plus/test";

import FacebookHandler from "../../src/handlers/FacebookHandler";
import { AUTH_CONNECTION } from "../../src/utils/enums";
import type { CreateHandlerParams } from "../../src/utils/interfaces";

const jwt = (payload: Record<string, unknown>) =>
  `${encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${encodeBase64Url(JSON.stringify(payload))}.sig`;

function makeHandler(overrides: Partial<CreateHandlerParams> = {}): FacebookHandler {
  return new FacebookHandler({
    authConnection: AUTH_CONNECTION.FACEBOOK,
    clientId: "123456",
    authConnectionId: "facebook-verifier",
    redirect_uri: "https://example.com/redirect",
    web3AuthClientId: "web3auth-client-id",
    web3AuthNetwork: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
    storageServerUrl: "https://storage-server.example.com",
    ...overrides,
  });
}

function decodeState(state: string): Record<string, unknown> {
  return JSON.parse(decodeBase64Url(decodeURIComponent(state)));
}

describe("FacebookHandler", () => {
  describe("setFinalUrl", () => {
    it("builds the dialog URL for the implicit OIDC flow", () => {
      const handler = makeHandler();
      const url = handler.finalURL;

      expect(`${url.origin}${url.pathname}`).toBe("https://www.facebook.com/v27.0/dialog/oauth");
      expect(url.searchParams.get("response_type")).toBe("id_token");
      expect(url.searchParams.get("scope")).toBe("openid email");
      expect(url.searchParams.get("nonce")).toBe(handler.nonce);
      expect(url.searchParams.get("client_id")).toBe("123456");
      expect(url.searchParams.get("redirect_uri")).toBe("https://example.com/redirect");
      expect(decodeState(url.searchParams.get("state") ?? "").instanceId).toBe(handler.nonce);
    });

    it("jwtParams cannot override the flow parameters", () => {
      const handler = makeHandler({
        jwtParams: { response_type: "token", nonce: "x", state: "y", scope: "public_profile" },
      });
      const url = handler.finalURL;

      expect(url.searchParams.getAll("response_type")).toEqual(["id_token"]);
      expect(url.searchParams.getAll("nonce")).toEqual([handler.nonce]);
      expect(decodeState(url.searchParams.get("state") ?? "").instanceId).toBe(handler.nonce);
      expect(url.searchParams.get("scope")).toBe("openid public_profile");
    });

    it("jwtParams can add other parameters", () => {
      const handler = makeHandler({ jwtParams: { auth_type: "rerequest" } });

      expect(handler.finalURL.searchParams.get("auth_type")).toBe("rerequest");
    });
  });

  describe("getUserInfo", () => {
    const state = { instanceId: "abc" };

    it("rejects without an id_token", async () => {
      await expect(makeHandler().getUserInfo({ accessToken: "EAAat", idToken: "", state })).rejects.toThrow(
        "Facebook login did not return an id_token"
      );
    });

    it("rejects an id_token that is not a JWT", async () => {
      await expect(makeHandler().getUserInfo({ accessToken: "", idToken: "EAAabc", state })).rejects.toThrow(
        "Facebook login returned an id_token that is not a JWT"
      );
    });

    it("rejects an id_token with the wrong nonce", async () => {
      await expect(makeHandler().getUserInfo({ accessToken: "", idToken: jwt({ nonce: "other", sub: "1" }), state })).rejects.toThrow(
        "Facebook id_token nonce mismatch"
      );
    });

    it("rejects an id_token without a nonce", async () => {
      await expect(makeHandler().getUserInfo({ accessToken: "", idToken: jwt({ sub: "1" }), state })).rejects.toThrow(
        "Facebook id_token nonce mismatch"
      );
    });

    it("rejects an id_token without a sub", async () => {
      await expect(makeHandler().getUserInfo({ accessToken: "", idToken: jwt({ nonce: "abc" }), state })).rejects.toThrow(
        "Facebook id_token has no sub"
      );
    });

    it("reads the profile from the id_token claims", async () => {
      const idToken = jwt({ nonce: "abc", sub: "1", name: "N", email: "e@x.test", picture: "https://pic.test/u" });

      const result = await makeHandler().getUserInfo({ accessToken: "", idToken, state });

      expect(result).toEqual({
        email: "e@x.test",
        name: "N",
        profileImage: "https://pic.test/u",
        authConnectionId: "facebook-verifier",
        authConnection: AUTH_CONNECTION.FACEBOOK,
        groupedAuthConnectionId: undefined,
        userId: "1",
      });
    });

    it("uses empty strings for missing profile claims", async () => {
      const result = await makeHandler().getUserInfo({ accessToken: "", idToken: jwt({ nonce: "abc", sub: "1" }), state });

      expect(result).toMatchObject({ email: "", name: "", profileImage: "", userId: "1" });
    });
  });
});
