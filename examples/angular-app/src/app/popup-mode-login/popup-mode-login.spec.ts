import { TestBed } from "@angular/core/testing";

import { CustomAuthService } from "../custom-auth";
import { PopupModeLogin } from "./popup-mode-login";

describe("PopupModeLogin", () => {
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

  it("sets error state when popup login fails", async () => {
    const serviceMock = {
      getDefaultFormData: () => ({
        uxMode: "popup",
        loginProvider: "google",
        loginHint: "",
        network: "sapphire_devnet",
      }),
      triggerLogin: async () => {
        throw new Error("user closed popup");
      },
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

    expect(component.status).toBe("error");
    expect(component.result).toContain("user closed popup");
  });
});
