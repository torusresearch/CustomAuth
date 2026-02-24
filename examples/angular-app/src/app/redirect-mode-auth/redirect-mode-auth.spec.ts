import { TestBed } from "@angular/core/testing";

import { CustomAuthService } from "../custom-auth";
import { RedirectModeAuth } from "./redirect-mode-auth";

describe("RedirectModeAuth", () => {
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

  it("sets error state when redirect resolution fails", async () => {
    const serviceMock = {
      getRedirectResult: async () => {
        throw new Error("redirect failure");
      },
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

    expect(component.status).toBe("error");
    expect(component.result).toContain("redirect failure");
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
