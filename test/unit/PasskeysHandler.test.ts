import { TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { encodeBase64Url, type Hex, keccak256, utf8ToBytes } from "@toruslabs/metadata-helpers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PasskeysHandler from "../../src/handlers/PasskeysHandler";
import { AUTH_CONNECTION } from "../../src/utils/enums";
import type { CreateHandlerParams, LoginWindowResponse, PasskeySessionData } from "../../src/utils/interfaces";
import * as sessionHelper from "../../src/utils/sessionHelper";

const TEST_SESSION_ID = keccak256(utf8ToBytes("passkey_test")) as Hex;

const PASSKEY_SESSION_DATA: PasskeySessionData = {
  verifier_id: "user@example.com",
  signature: "test_signature_abc",
  clientDataJSON: "client_data_json",
  authenticatorData: "auth_data",
  publicKey: "pub_key_hex",
  challenge: "challenge_string",
  rpOrigin: "https://example.com",
  rpId: "example.com",
  credId: "cred_123",
  transports: ["internal"],
  username: "testuser",
};

function makeHandlerParams(overrides: Partial<CreateHandlerParams> = {}): CreateHandlerParams {
  return {
    authConnection: AUTH_CONNECTION.PASSKEYS,
    clientId: "test-client-id",
    authConnectionId: "passkeys-verifier",
    redirect_uri: "https://example.com/redirect",
    web3AuthClientId: "web3auth-client-id",
    web3AuthNetwork: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET,
    customState: { passkeysHostUrl: "https://passkeys.example.com" },
    ...overrides,
  };
}

function makeLoginWindowResponse(overrides: Partial<LoginWindowResponse> = {}): LoginWindowResponse {
  const extraParams = encodeBase64Url(JSON.stringify({ sessionId: TEST_SESSION_ID }));
  return {
    accessToken: "",
    idToken: PASSKEY_SESSION_DATA.signature,
    extraParams,
    state: {},
    ...overrides,
  };
}

describe("PasskeysHandler", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(sessionHelper, "fetchDataFromBroadcastServer");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor / setFinalUrl", () => {
    it("throws if passkeysHostUrl is missing from customState", () => {
      expect(() => new PasskeysHandler(makeHandlerParams({ customState: {} }))).toThrow("Invalid passkeys url.");
    });

    it("throws if customState is undefined", () => {
      expect(() => new PasskeysHandler(makeHandlerParams({ customState: undefined }))).toThrow("Invalid passkeys url.");
    });

    it("builds finalURL with passkeysHostUrl and merged params", () => {
      const handler = new PasskeysHandler(makeHandlerParams());

      expect(handler.finalURL.origin).toBe("https://passkeys.example.com");
      expect(handler.finalURL.searchParams.get("client_id")).toBe("test-client-id");
      expect(handler.finalURL.searchParams.get("redirect_uri")).toBe("https://example.com/redirect");
      expect(handler.finalURL.searchParams.has("state")).toBe(true);
    });

    it("merges jwtParams into the final URL", () => {
      const handler = new PasskeysHandler(
        makeHandlerParams({
          jwtParams: { scope: "openid email" },
        })
      );

      expect(handler.finalURL.searchParams.get("scope")).toBe("openid email");
    });
  });

  describe("getUserInfo", () => {
    it("returns correct TorusConnectionResponse on success", async () => {
      fetchSpy.mockResolvedValue(PASSKEY_SESSION_DATA);

      const handler = new PasskeysHandler(makeHandlerParams());
      const result = await handler.getUserInfo(makeLoginWindowResponse());

      expect(result).toEqual({
        email: "",
        name: "Passkeys Login",
        profileImage: "",
        authConnectionId: "passkeys-verifier",
        userId: PASSKEY_SESSION_DATA.verifier_id,
        authConnection: AUTH_CONNECTION.PASSKEYS,
        groupedAuthConnectionId: undefined,
        extraConnectionParams: {
          signature: PASSKEY_SESSION_DATA.signature,
          clientDataJSON: PASSKEY_SESSION_DATA.clientDataJSON,
          authenticatorData: PASSKEY_SESSION_DATA.authenticatorData,
          publicKey: PASSKEY_SESSION_DATA.publicKey,
          challenge: PASSKEY_SESSION_DATA.challenge,
          rpOrigin: PASSKEY_SESSION_DATA.rpOrigin,
          rpId: PASSKEY_SESSION_DATA.rpId,
          credId: PASSKEY_SESSION_DATA.credId,
          transports: PASSKEY_SESSION_DATA.transports,
          username: PASSKEY_SESSION_DATA.username,
        },
      });
    });

    it("calls fetchDataFromBroadcastServer with correct sessionId", async () => {
      fetchSpy.mockResolvedValue(PASSKEY_SESSION_DATA);

      const handler = new PasskeysHandler(makeHandlerParams());
      await handler.getUserInfo(makeLoginWindowResponse());

      expect(fetchSpy).toHaveBeenCalledWith(TEST_SESSION_ID, undefined);
    });

    it("passes storageServerUrl to fetchDataFromBroadcastServer", async () => {
      fetchSpy.mockResolvedValue(PASSKEY_SESSION_DATA);

      const handler = new PasskeysHandler(makeHandlerParams());
      await handler.getUserInfo(makeLoginWindowResponse(), "https://custom-server.io");

      expect(fetchSpy).toHaveBeenCalledWith(TEST_SESSION_ID, "https://custom-server.io");
    });

    it("throws if sessionId is missing from extraParams", async () => {
      const handler = new PasskeysHandler(makeHandlerParams());
      const params = makeLoginWindowResponse({
        extraParams: encodeBase64Url(JSON.stringify({})),
      });

      await expect(handler.getUserInfo(params)).rejects.toThrow("sessionId not found");
    });

    it("throws if sessionId is not a valid hex string", async () => {
      const handler = new PasskeysHandler(makeHandlerParams());
      const params = makeLoginWindowResponse({
        extraParams: encodeBase64Url(JSON.stringify({ sessionId: "not-hex!" })),
      });

      await expect(handler.getUserInfo(params)).rejects.toThrow("sessionId is not a valid hex string");
    });

    it("throws if signature does not match idToken", async () => {
      fetchSpy.mockResolvedValue(PASSKEY_SESSION_DATA);

      const handler = new PasskeysHandler(makeHandlerParams());
      const params = makeLoginWindowResponse({ idToken: "wrong_signature" });

      await expect(handler.getUserInfo(params)).rejects.toThrow("idtoken should be equal to signature");
    });

    it("propagates errors from fetchDataFromBroadcastServer", async () => {
      fetchSpy.mockRejectedValue(new Error("Session expired"));

      const handler = new PasskeysHandler(makeHandlerParams());

      await expect(handler.getUserInfo(makeLoginWindowResponse())).rejects.toThrow("Session expired");
    });
  });
});
