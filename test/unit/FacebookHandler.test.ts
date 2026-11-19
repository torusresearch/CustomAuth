import { TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { get } from "@toruslabs/http-helpers";
import { decodeBase64Url, encodeBase64Url } from "@toruslabs/metadata-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import FacebookHandler from "../../src/handlers/FacebookHandler";
import { AUTH_CONNECTION } from "../../src/utils/enums";
import type { CreateHandlerParams } from "../../src/utils/interfaces";

vi.mock("@toruslabs/http-helpers", () => ({
  get: vi.fn<() => Promise<unknown>>(),
}));

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
  beforeEach(() => {
    vi.mocked(get).mockReset();
  });

  describe("setFinalUrl", () => {
    it("builds the dialog URL for the implicit OIDC flow", () => {
      const handler = makeHandler();
      const url = handler.finalURL;

      expect(`${url.origin}${url.pathname}`).toBe("https://www.facebook.com/v27.0/dialog/oauth");
      expect(url.searchParams.get("response_type")).toBe("token id_token");
      expect(url.searchParams.get("scope")).toBe("openid public_profile email");
      expect(url.searchParams.get("nonce")).toBe(handler.nonce);
      expect(url.searchParams.get("client_id")).toBe("123456");
      expect(url.searchParams.get("redirect_uri")).toBe("https://example.com/redirect");
      expect(decodeState(url.searchParams.get("state") ?? "").instanceId).toBe(handler.nonce);
    });

    it("jwtParams cannot override the flow parameters", () => {
      const handler = makeHandler({
        jwtParams: { response_type: "token", nonce: "x", state: "y", scope: "email" },
      });
      const url = handler.finalURL;

      expect(url.searchParams.getAll("response_type")).toEqual(["token id_token"]);
      expect(url.searchParams.getAll("nonce")).toEqual([handler.nonce]);
      expect(decodeState(url.searchParams.get("state") ?? "").instanceId).toBe(handler.nonce);
      expect(url.searchParams.get("scope")).toBe("openid email");
    });

    it("jwtParams can add other parameters", () => {
      const handler = makeHandler({ jwtParams: { auth_type: "rerequest" } });

      expect(handler.finalURL.searchParams.get("auth_type")).toBe("rerequest");
    });
  });

  describe("getUserInfo", () => {
    it("rejects without an id_token", async () => {
      const handler = makeHandler();

      await expect(handler.getUserInfo({ accessToken: "at", idToken: "", state: { instanceId: "abc" } })).rejects.toThrow(
        "Facebook login did not return an id_token"
      );
      expect(get).not.toHaveBeenCalled();
    });

    it("rejects an id_token that is not a JWT", async () => {
      const handler = makeHandler();

      await expect(handler.getUserInfo({ accessToken: "at", idToken: "EAAabc", state: { instanceId: "abc" } })).rejects.toThrow(
        "Facebook login returned an id_token that is not a JWT"
      );
      expect(get).not.toHaveBeenCalled();
    });

    it("rejects an id_token with the wrong nonce", async () => {
      const handler = makeHandler();

      await expect(handler.getUserInfo({ accessToken: "at", idToken: jwt({ nonce: "other" }), state: { instanceId: "abc" } })).rejects.toThrow(
        "Facebook id_token nonce mismatch"
      );
      expect(get).not.toHaveBeenCalled();
    });

    it("rejects an id_token without a nonce", async () => {
      const handler = makeHandler();

      await expect(handler.getUserInfo({ accessToken: "at", idToken: jwt({ sub: "1" }), state: { instanceId: "abc" } })).rejects.toThrow(
        "Facebook id_token nonce mismatch"
      );
      expect(get).not.toHaveBeenCalled();
    });

    it("rejects without an access token", async () => {
      const handler = makeHandler();

      await expect(handler.getUserInfo({ accessToken: "", idToken: jwt({ nonce: "abc" }), state: { instanceId: "abc" } })).rejects.toThrow(
        "Facebook login did not return an access_token"
      );
      expect(get).not.toHaveBeenCalled();
    });

    it("reads the profile from Graph v27.0", async () => {
      vi.mocked(get).mockResolvedValue({ id: "1", name: "N", email: "e@x.test", picture: { data: { url: "u" } } });
      const handler = makeHandler();

      const result = await handler.getUserInfo({ accessToken: "at", idToken: jwt({ nonce: "abc" }), state: { instanceId: "abc" } });

      expect(get).toHaveBeenCalledWith(expect.stringMatching(/^https:\/\/graph\.facebook\.com\/v27\.0\/me\?/), {
        headers: { Authorization: "Bearer at" },
      });
      expect(result).toEqual({
        email: "e@x.test",
        name: "N",
        profileImage: "u",
        authConnectionId: "facebook-verifier",
        authConnection: AUTH_CONNECTION.FACEBOOK,
        groupedAuthConnectionId: undefined,
        userId: "1",
      });
    });
  });
});
