import type { TORUS_NETWORK_TYPE } from "@toruslabs/constants";
import { encodeBase64Url } from "@toruslabs/metadata-helpers";
import { SessionManager } from "@toruslabs/session-manager";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createHandler } from "../../src/handlers/HandlerFactory";
import { UX_MODE } from "../../src/utils/enums";
import type { CustomAuthArgs, ILoginHandler, LoginWindowResponse, TorusConnectionResponse } from "../../src/utils/interfaces";

vi.mock("@toruslabs/torus.js", () => {
  function Torus() {
    (this as Record<string, unknown>).retrieveShares = vi.fn().mockResolvedValue({
      finalKeyData: { privKey: "0xdeadbeef" },
    });
  }
  Torus.setAPIKey = vi.fn();
  return { Torus };
});

vi.mock("@toruslabs/fetch-node-details", () => ({
  NodeDetailManager: vi.fn().mockImplementation(function () {
    (this as Record<string, unknown>).getNodeDetails = vi.fn().mockResolvedValue({
      torusNodeEndpoints: ["https://node1.example.com"],
      torusIndexes: [1],
      torusNodePub: [{ X: "x", Y: "y" }],
    });
  }),
}));

vi.mock("../../src/handlers/HandlerFactory", () => ({
  createHandler: vi.fn(),
}));

vi.mock("../../src/registerServiceWorker", () => ({
  registerServiceWorker: vi.fn(),
}));

vi.mock("../../src/sentry", () => ({
  default: vi.fn().mockImplementation(function () {
    (this as Record<string, unknown>).startSpan = vi.fn((_opts: unknown, fn: () => unknown) => fn());
  }),
}));

const BASE_ARGS: CustomAuthArgs = {
  baseUrl: "https://example.com/serviceworker/",
  network: "sapphire_devnet" as TORUS_NETWORK_TYPE,
  web3AuthClientId: "test-client-id",
};

function mockLoginHandler(overrides: Partial<ILoginHandler> = {}): ILoginHandler {
  return {
    nonce: "test_nonce_123",
    params: {} as ILoginHandler["params"],
    finalURL: new URL("https://auth.example.com"),
    getUserInfo: vi.fn<() => Promise<TorusConnectionResponse>>().mockResolvedValue({
      email: "user@test.com",
      name: "Test User",
      profileImage: "",
      authConnectionId: "google-verifier",
      userId: "user@test.com",
      authConnection: "google",
    }),
    handleLoginWindow: vi.fn<() => Promise<LoginWindowResponse>>().mockResolvedValue({
      accessToken: "mock_access",
      idToken: "mock_id_token",
      state: { instanceId: "test_nonce_123" },
    }),
    ...overrides,
  };
}

describe("CustomAuth", () => {
  let createSessionSpy: ReturnType<typeof vi.spyOn>;
  let authorizeSessionSpy: ReturnType<typeof vi.spyOn>;
  let setSessionIdSpy: ReturnType<typeof vi.spyOn>;
  let clearOrphanedSpy: ReturnType<typeof vi.spyOn>;
  let clearStorageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    createSessionSpy = vi.spyOn(SessionManager.prototype, "createSession").mockResolvedValue("0xsession");
    authorizeSessionSpy = vi.spyOn(SessionManager.prototype, "authorizeSession");
    setSessionIdSpy = vi.spyOn(SessionManager.prototype, "setSessionId");
    clearOrphanedSpy = vi.spyOn(SessionManager.prototype, "clearOrphanedData");
    clearStorageSpy = vi.spyOn(SessionManager.prototype, "clearStorage");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Lazy import to ensure mocks are registered first
  async function getCustomAuth() {
    const { CustomAuth } = await import("../../src/login");
    return CustomAuth;
  }

  describe("constructor", () => {
    it("throws if web3AuthClientId is missing", async () => {
      const CustomAuth = await getCustomAuth();
      expect(() => new CustomAuth({ ...BASE_ARGS, web3AuthClientId: "" } as CustomAuthArgs)).toThrow(
        "Please provide a valid web3AuthClientId in constructor"
      );
    });

    it("throws if network is missing", async () => {
      const CustomAuth = await getCustomAuth();
      expect(() => new CustomAuth({ ...BASE_ARGS, network: "" as TORUS_NETWORK_TYPE })).toThrow("Please provide a valid network in constructor");
    });

    it("creates instance with valid params", async () => {
      const CustomAuth = await getCustomAuth();
      const auth = new CustomAuth(BASE_ARGS);
      expect(auth.isInitialized).toBe(false);
      expect(auth.config.baseUrl).toBe("https://example.com/serviceworker/");
      expect(auth.config.uxMode).toBe(UX_MODE.POPUP);
    });
  });

  describe("triggerLogin – redirect mode", () => {
    it("stores login args via session manager and returns null", async () => {
      const CustomAuth = await getCustomAuth();
      const handler = mockLoginHandler({
        handleLoginWindow: vi.fn().mockResolvedValue(null),
      });
      vi.mocked(createHandler).mockReturnValue(handler);

      const auth = new CustomAuth({ ...BASE_ARGS, uxMode: UX_MODE.REDIRECT });
      auth.isInitialized = true;

      const result = await auth.triggerLogin({
        authConnection: "google",
        authConnectionId: "google-verifier",
        clientId: "google-client-id",
      });

      expect(result).toBeNull();
      expect(clearOrphanedSpy).toHaveBeenCalled();
      expect(setSessionIdSpy).toHaveBeenCalled();
      expect(createSessionSpy).toHaveBeenCalledWith({
        args: expect.objectContaining({
          authConnection: "google",
          authConnectionId: "google-verifier",
          clientId: "google-client-id",
        }),
      });
    });

    it("generates consistent session IDs for the same nonce", async () => {
      const CustomAuth = await getCustomAuth();
      const handler = mockLoginHandler({
        nonce: "fixed_nonce",
        handleLoginWindow: vi.fn().mockResolvedValue(null),
      });
      vi.mocked(createHandler).mockReturnValue(handler);

      const auth = new CustomAuth({ ...BASE_ARGS, uxMode: UX_MODE.REDIRECT });
      auth.isInitialized = true;

      await auth.triggerLogin({
        authConnection: "google",
        authConnectionId: "google-verifier",
        clientId: "google-client-id",
      });

      const firstSessionId = setSessionIdSpy.mock.calls[0][0];

      vi.clearAllMocks();
      createSessionSpy = vi.spyOn(SessionManager.prototype, "createSession").mockResolvedValue("0xsession");
      setSessionIdSpy = vi.spyOn(SessionManager.prototype, "setSessionId");
      clearOrphanedSpy = vi.spyOn(SessionManager.prototype, "clearOrphanedData");
      vi.mocked(createHandler).mockReturnValue(
        mockLoginHandler({
          nonce: "fixed_nonce",
          handleLoginWindow: vi.fn().mockResolvedValue(null),
        })
      );

      const auth2 = new CustomAuth({ ...BASE_ARGS, uxMode: UX_MODE.REDIRECT });
      auth2.isInitialized = true;
      await auth2.triggerLogin({
        authConnection: "google",
        authConnectionId: "google-verifier",
        clientId: "google-client-id",
      });

      expect(setSessionIdSpy.mock.calls[0][0]).toBe(firstSessionId);
    });
  });

  describe("triggerLogin – popup mode with hash/queryParameters", () => {
    it("processes redirect parameters without session manager storage", async () => {
      const CustomAuth = await getCustomAuth();

      const stateObj = {
        instanceId: "test_nonce_123",
        authConnectionId: "google-verifier",
        authConnection: "google",
      };
      const stateEncoded = encodeURIComponent(encodeBase64Url(JSON.stringify(stateObj)));
      const hash = `access_token=mock_access&id_token=mock_id_token&state=${stateEncoded}`;

      const handler = mockLoginHandler();
      vi.mocked(createHandler).mockReturnValue(handler);

      const auth = new CustomAuth(BASE_ARGS);
      auth.isInitialized = true;

      await auth.triggerLogin({
        authConnection: "google",
        authConnectionId: "google-verifier",
        clientId: "google-client-id",
        hash,
        queryParameters: {},
      });

      expect(createSessionSpy).not.toHaveBeenCalled();
      expect(authorizeSessionSpy).not.toHaveBeenCalled();
      expect(handler.getUserInfo).toHaveBeenCalled();
    });
  });

  describe("triggerLogin – not initialized", () => {
    it("throws if not initialized", async () => {
      const CustomAuth = await getCustomAuth();
      const auth = new CustomAuth(BASE_ARGS);

      await expect(
        auth.triggerLogin({
          authConnection: "google",
          authConnectionId: "google-verifier",
          clientId: "google-client-id",
        })
      ).rejects.toThrow("Not initialized yet");
    });
  });

  describe("getRedirectResult", () => {
    const savedWindow = globalThis.window;

    function setupWindowLocation(hash: string, searchParams = "") {
      const href = `https://example.com/redirect${searchParams ? `?${searchParams}` : ""}#${hash}`;
      globalThis.window = {
        location: {
          href,
          origin: "https://example.com",
          pathname: "/redirect",
        },
        history: {
          state: {},
          replaceState: vi.fn(),
        },
      } as unknown as Window & typeof globalThis;
    }

    afterEach(() => {
      globalThis.window = savedWindow;
    });

    it("retrieves login details from session manager and clears storage on success", async () => {
      const CustomAuth = await getCustomAuth();

      const stateObj = {
        instanceId: "redir_nonce",
        authConnectionId: "google-verifier",
        authConnection: "google",
      };
      const stateEncoded = encodeURIComponent(encodeBase64Url(JSON.stringify(stateObj)));
      const hash = `access_token=mock_access&id_token=mock_id_token&state=${stateEncoded}`;

      setupWindowLocation(hash);

      const storedArgs = {
        authConnection: "google" as const,
        authConnectionId: "google-verifier",
        clientId: "google-client-id",
      };
      authorizeSessionSpy.mockResolvedValue({ args: storedArgs });

      const handler = mockLoginHandler();
      vi.mocked(createHandler).mockReturnValue(handler);

      const auth = new CustomAuth(BASE_ARGS);
      const result = await auth.getRedirectResult({ replaceUrl: false });

      expect(setSessionIdSpy).toHaveBeenCalled();
      expect(authorizeSessionSpy).toHaveBeenCalled();
      expect(clearStorageSpy).toHaveBeenCalled();
      expect(result.error).toBeUndefined();
      expect(result.result).toBeDefined();
    });

    it("clears storage on triggerLogin error", async () => {
      const CustomAuth = await getCustomAuth();

      const stateObj = {
        instanceId: "err_nonce",
        authConnectionId: "google-verifier",
        authConnection: "google",
      };
      const stateEncoded = encodeURIComponent(encodeBase64Url(JSON.stringify(stateObj)));
      const hash = `access_token=mock_access&id_token=mock_id_token&state=${stateEncoded}`;

      setupWindowLocation(hash);

      const storedArgs = {
        authConnection: "google" as const,
        authConnectionId: "google-verifier",
        clientId: "google-client-id",
      };
      authorizeSessionSpy.mockResolvedValue({ args: storedArgs });

      const handler = mockLoginHandler({
        getUserInfo: vi.fn().mockRejectedValue(new Error("Login failed")),
      });
      vi.mocked(createHandler).mockReturnValue(handler);

      const auth = new CustomAuth(BASE_ARGS);
      const result = await auth.getRedirectResult({ replaceUrl: false });

      expect(result.error).toContain("Login failed");
      expect(clearStorageSpy).toHaveBeenCalled();
    });

    it("returns error from redirect parameters without calling triggerLogin", async () => {
      const CustomAuth = await getCustomAuth();

      const stateObj = { instanceId: "err_redir_nonce" };
      const stateEncoded = encodeURIComponent(encodeBase64Url(JSON.stringify(stateObj)));
      const hash = `error=access_denied&error_description=User+denied&state=${stateEncoded}`;

      setupWindowLocation(hash);

      authorizeSessionSpy.mockResolvedValue({
        args: {
          authConnection: "google",
          authConnectionId: "google-verifier",
          clientId: "google-client-id",
        },
      });

      const auth = new CustomAuth(BASE_ARGS);
      const result = await auth.getRedirectResult({ replaceUrl: false });

      expect(result.error).toBe("User+denied");
      expect(vi.mocked(createHandler)).not.toHaveBeenCalled();
    });

    it("uses storageData when provided, skipping session manager", async () => {
      const CustomAuth = await getCustomAuth();

      const stateObj = {
        instanceId: "storage_nonce",
        authConnectionId: "google-verifier",
        authConnection: "google",
      };
      const stateEncoded = encodeURIComponent(encodeBase64Url(JSON.stringify(stateObj)));
      const hash = `access_token=mock_access&id_token=mock_id_token&state=${stateEncoded}`;

      setupWindowLocation(hash);

      const handler = mockLoginHandler();
      vi.mocked(createHandler).mockReturnValue(handler);

      const auth = new CustomAuth(BASE_ARGS);
      await auth.getRedirectResult({
        replaceUrl: false,
        clearLoginDetails: false,
        storageData: {
          args: {
            authConnection: "google",
            authConnectionId: "google-verifier",
            clientId: "google-client-id",
          },
        },
      });

      expect(authorizeSessionSpy).not.toHaveBeenCalled();
    });

    it("throws when hash and query are both empty", async () => {
      const CustomAuth = await getCustomAuth();
      setupWindowLocation("");

      const auth = new CustomAuth(BASE_ARGS);
      await expect(auth.getRedirectResult()).rejects.toThrow("Found Empty hash and query parameters");
    });
  });
});
