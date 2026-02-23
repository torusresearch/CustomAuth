import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { CustomAuthService } from "../custom-auth";
import { PopupModeLogin } from "./popup-mode-login";

describe("PopupModeLogin", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("sets success state after popup login resolves", async () => {
    const serviceMock = {
      getDefaultFormData: () => ({
        uxMode: "popup",
        loginProvider: "google",
        loginHint: "",
        network: "sapphire_devnet",
      }),
      triggerLogin: async () => ({ userInfo: { name: "PopupUser" } }),
      saveLoginResult: () => {},
      stringifyForDisplay: (value: unknown) => JSON.stringify(value, null, 2),
    };

    await TestBed.configureTestingModule({
      imports: [PopupModeLogin],
      providers: [{ provide: CustomAuthService, useValue: serviceMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(PopupModeLogin);
    const component = fixture.componentInstance;
    await component.login();

    expect(component.status).toBe("success");
    expect(component.result).toContain("PopupUser");
  });

  it("sets error state when popup login hangs", async () => {
    vi.useFakeTimers();
    const serviceMock = {
      getDefaultFormData: () => ({
        uxMode: "popup",
        loginProvider: "google",
        loginHint: "",
        network: "sapphire_devnet",
      }),
      triggerLogin: () => new Promise(() => {}),
      saveLoginResult: () => {},
      stringifyForDisplay: (value: unknown) => JSON.stringify(value, null, 2),
    };

    await TestBed.configureTestingModule({
      imports: [PopupModeLogin],
      providers: [{ provide: CustomAuthService, useValue: serviceMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(PopupModeLogin);
    const component = fixture.componentInstance;
    const run = component.login();
    await vi.advanceTimersByTimeAsync(16000);
    await run;

    expect(component.status).toBe("error");
  });
});
