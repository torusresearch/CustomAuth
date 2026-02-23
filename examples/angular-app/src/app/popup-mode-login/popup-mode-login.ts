import { ChangeDetectorRef, Component } from "@angular/core";
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
  selector: "app-popup-mode-login",
  imports: [FormsModule],
  templateUrl: "./popup-mode-login.html",
  styleUrl: "./popup-mode-login.css",
})
export class PopupModeLogin {
  formData: FormData;
  status: "idle" | "loading" | "success" | "error" = "idle";
  result = "";
  private readonly popupTimeoutMs = 15000;
  readonly networkOptions = networkOptions;
  readonly sapphireDevnetVerifierOptions = sapphireDevnetVerifierOptions;
  readonly testnetVerifierOptions = testnetVerifierOptions;
  readonly emailPasswordless = WEB3AUTH_EMAIL_PASSWORDLESS;
  readonly smsPasswordless = WEB3AUTH_SMS_PASSWORDLESS;

  constructor(
    private readonly authService: CustomAuthService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.formData = this.authService.getDefaultFormData(UX_MODE.POPUP);
  }

  get verifierOptions(): string[] {
    return this.formData.network === TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET ? this.sapphireDevnetVerifierOptions : this.testnetVerifierOptions;
  }

  async login(): Promise<void> {
    this.status = "loading";
    this.result = "";
    try {
      const loginResult = await this.authService.triggerLogin(this.formData);
      if (!loginResult) {
        throw new Error("Popup login finished without returning a result.");
      }

      this.authService.saveLoginResult(loginResult);
      this.result = this.authService.stringifyForDisplay(loginResult);
      this.status = "success";
      this.cdr.detectChanges();
    } catch (error) {
      this.result = (error as Error).message;
      this.status = "error";
      this.cdr.detectChanges();
    }
  }
}
