import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { CustomAuthService } from "../custom-auth";
import { RedirectModeAuth } from "./redirect-mode-auth";

describe("RedirectModeAuth", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads redirect result and sets success state", async () => {
    const serviceMock = {
      getRedirectResult: async () => ({ userInfo: { name: "Demo" } }),
      hasPendingRedirectState: () => true,
      getStoredLoginResult: () => null,
      saveLoginResult: () => {},
      stringifyForDisplay: (value: unknown) => JSON.stringify(value, null, 2),
    };

    await TestBed.configureTestingModule({
      imports: [RedirectModeAuth],
      providers: [{ provide: CustomAuthService, useValue: serviceMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(RedirectModeAuth);
    const component = fixture.componentInstance;
    component.ngOnInit();
    await Promise.resolve();

    expect(component.status).toBe("success");
    expect(component.result).toContain("Demo");
  });

  it("sets error state when redirect resolution hangs", async () => {
    vi.useFakeTimers();
    const serviceMock = {
      getRedirectResult: () => new Promise(() => {}),
      hasPendingRedirectState: () => true,
      getStoredLoginResult: () => null,
      saveLoginResult: () => {},
      stringifyForDisplay: (value: unknown) => JSON.stringify(value, null, 2),
    };

    await TestBed.configureTestingModule({
      imports: [RedirectModeAuth],
      providers: [{ provide: CustomAuthService, useValue: serviceMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(RedirectModeAuth);
    const component = fixture.componentInstance;
    component.ngOnInit();
    await vi.advanceTimersByTimeAsync(11000);
    await Promise.resolve();

    expect(component.status).toBe("error");
  });

  it("uses cached result on reload without oauth params", async () => {
    const serviceMock = {
      getRedirectResult: async () => ({ userInfo: { name: "Ignored" } }),
      hasPendingRedirectState: () => false,
      getStoredLoginResult: () => ({ userInfo: { name: "CachedUser" } }),
      saveLoginResult: () => {},
      stringifyForDisplay: (value: unknown) => JSON.stringify(value, null, 2),
    };

    await TestBed.configureTestingModule({
      imports: [RedirectModeAuth],
      providers: [{ provide: CustomAuthService, useValue: serviceMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(RedirectModeAuth);
    const component = fixture.componentInstance;
    component.ngOnInit();
    await Promise.resolve();

    expect(component.status).toBe("success");
    expect(component.result).toContain("CachedUser");
  });
});
