import { type Hex, keccak256, utf8ToBytes } from "@toruslabs/metadata-helpers";
import { SessionManager } from "@toruslabs/session-manager";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchDataFromBroadcastServer } from "../../src/utils/sessionHelper";

function makeSessionId(label: string): Hex {
  return keccak256(utf8ToBytes(label)) as Hex;
}

describe("fetchDataFromBroadcastServer", () => {
  const sessionId = makeSessionId("unit_test_session");
  let authorizeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    authorizeSpy = vi.spyOn(SessionManager.prototype, "authorizeSession");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns data from the session server on success", async () => {
    const payload = { verifier_id: "user@example.com", token: "abc123" };
    authorizeSpy.mockResolvedValue(payload);

    const result = await fetchDataFromBroadcastServer(sessionId);

    expect(result).toEqual(payload);
    expect(authorizeSpy).toHaveBeenCalledOnce();
  });

  it("throws a descriptive error when authorizeSession fails", async () => {
    authorizeSpy.mockRejectedValue(new Error("Network error"));

    await expect(fetchDataFromBroadcastServer(sessionId)).rejects.toThrow("Unable to retrieve data from storage server, invalid key or key expired.");
  });

  it("throws a descriptive error when authorizeSession returns undefined", async () => {
    authorizeSpy.mockRejectedValue(new Error("Session Expired or Invalid public key"));

    await expect(fetchDataFromBroadcastServer(sessionId)).rejects.toThrow("Unable to retrieve data from storage server, invalid key or key expired.");
  });
});
