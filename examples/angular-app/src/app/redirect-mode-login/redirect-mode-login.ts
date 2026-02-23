import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";
import { UX_MODE } from "@toruslabs/customauth";

import {
  FormData,
  networkOptions,
  sapphireDevnetVerifierOptions,
  testnetVerifierOptions,
  WEB3AUTH_EMAIL_PASSWORDLESS,
  WEB3AUTH_SMS_PASSWORDLESS,
} from "../config";
import { CustomAuthService } from "../custom-auth";

@Component({
  selector: "app-redirect-mode-login",
  imports: [FormsModule],
  templateUrl: "./redirect-mode-login.html",
  styleUrl: "./redirect-mode-login.css",
})
export class RedirectModeLogin {
  formData: FormData;
  status: "idle" | "loading" | "error" = "idle";
  result = "";
  readonly networkOptions = networkOptions;
  readonly sapphireDevnetVerifierOptions = sapphireDevnetVerifierOptions;
  readonly testnetVerifierOptions = testnetVerifierOptions;
  readonly emailPasswordless = WEB3AUTH_EMAIL_PASSWORDLESS;
  readonly smsPasswordless = WEB3AUTH_SMS_PASSWORDLESS;

  constructor(private readonly authService: CustomAuthService) {
    this.formData = this.authService.getDefaultFormData(UX_MODE.REDIRECT);
  }

  get verifierOptions(): string[] {
    return this.formData.network === TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET ? this.sapphireDevnetVerifierOptions : this.testnetVerifierOptions;
  }

  async login(): Promise<void> {
    this.status = "loading";
    this.result = "";
    try {
      await this.authService.triggerLogin(this.formData);
    } catch (error) {
      this.result = (error as Error).message;
      this.status = "error";
    }
  }
}
