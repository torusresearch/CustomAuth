import { TestBed } from "@angular/core/testing";
import { TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { UX_MODE } from "@toruslabs/customauth";

import { CustomAuthService } from "./custom-auth";

describe("CustomAuthService", () => {
  let service: CustomAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomAuthService);
  });

  it("returns redirect defaults for form data", () => {
    const formData = service.getDefaultFormData(UX_MODE.REDIRECT);

    expect(formData.uxMode).toBe(UX_MODE.REDIRECT);
    expect(formData.network).toBe(TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET);
    expect(formData.loginProvider).toBe("google");
  });

  it("returns verifier map for selected network", () => {
    const verifierMap = service.getVerifierMap(TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET);
    expect(verifierMap["google"]).toBeDefined();
  });

  it("serializes bigint values for storage safely", () => {
    service.saveLoginResult({
      finalKeyData: { privKey: "abc" },
      sessionData: { sessionTokenData: [{ signature: 1n }] },
    } as unknown as never);

    expect(localStorage.getItem("privKey")).toBe("abc");
  });

  it("stores only privKey and userInfo fields", () => {
    service.saveLoginResult({
      finalKeyData: { privKey: "priv_key_value" },
      userInfo: { name: "Alice" },
      sessionData: { sessionTokenData: [{ signature: 1n }] },
    } as unknown as never);

    expect(localStorage.getItem("privKey")).toBe("priv_key_value");
    expect(localStorage.getItem("userInfo")).toBe('{"name":"Alice"}');
    expect(localStorage.getItem("angular_custom_auth_result")).toBeNull();
  });

  it("uses BroadcastChannel base64url decoder in popup callback assets", async () => {
    const redirectUrl = new URL("/serviceworker/redirect", window.location.origin).toString();
    const serviceWorkerUrl = new URL("/serviceworker/sw.js", window.location.origin).toString();
    const [redirectHtml, serviceWorkerScript] = await Promise.all([
      fetch(redirectUrl).then((response) => response.text()),
      fetch(serviceWorkerUrl).then((response) => response.text()),
    ]);

    expect(redirectHtml).toContain("BroadcastChannel.decodeBase64Url");
    expect(serviceWorkerScript).toContain("BroadcastChannel.decodeBase64Url");
  });
});
