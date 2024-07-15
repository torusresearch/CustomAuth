import { Component, OnInit } from "@angular/core";
import { CustomAuth, Auth0ClientOptions } from "@toruslabs/customauth";

import {
  verifierMap,
  GOOGLE,
  GITHUB,
  TWITTER,
  APPLE,
  AUTH_DOMAIN,
  EMAIL_PASSWORD,
  HOSTED_EMAIL_PASSWORDLESS,
  HOSTED_SMS_PASSWORDLESS,
  LINE,
  LINKEDIN,
  WEIBO,
  COGNITO_AUTH_DOMAIN,
  COGNITO,
  REDDIT,
} from "../../constants/index";

@Component({
  selector: "app-redirect-mode-login",
  templateUrl: "./redirect-mode-login.component.html",
  styleUrls: ["./redirect-mode-login.component.css"],
})
export class RedirectModeLoginComponent implements OnInit {
  torusdirectsdk: CustomAuth | null = null;
  selectedVerifier = GOOGLE;

  verifierMap = verifierMap;

  verifierMapKeys = Object.keys(this.verifierMap);

  async ngOnInit() {
    try {
      const torusdirectsdk = new CustomAuth({
        baseUrl: location.origin,
        redirectPathName: "auth",
        enableLogging: true,
        uxMode: "redirect",
        network: "testnet",
      });
      await torusdirectsdk.init({ skipSw: true, skipPrefetch: true });
      this.torusdirectsdk = torusdirectsdk;
      console.log("initialized");
    } catch (error) {
      console.error(error, "oninit caught");
    }
  }

  async login() {
    try {
      const jwtParams = this._loginToConnectionMap()[this.selectedVerifier] || { domain: undefined };
      const { typeOfLogin, clientId, verifier } = this.verifierMap[this.selectedVerifier];
      await this.torusdirectsdk?.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
      });
    } catch (error) {
      console.error(error, "login caught");
    }
  }

  onSelectedVerifierChanged = (event: any) => {
    this.selectedVerifier = event.target.value;
  };

  _loginToConnectionMap = (): Record<string, Auth0ClientOptions> => {
    return {
      [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },
      [HOSTED_EMAIL_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "", isVerifierIdCaseSensitive: false },
      [HOSTED_SMS_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "" },
      [APPLE]: { domain: AUTH_DOMAIN },
      [GITHUB]: { domain: AUTH_DOMAIN },
      [LINKEDIN]: { domain: AUTH_DOMAIN },
      [TWITTER]: { domain: AUTH_DOMAIN },
      [WEIBO]: { domain: AUTH_DOMAIN },
      [LINE]: { domain: AUTH_DOMAIN },
      [COGNITO]: { domain: COGNITO_AUTH_DOMAIN, identity_provider: "Google", response_type: "token", user_info_endpoint: "userInfo" },
      [REDDIT]: { domain: AUTH_DOMAIN, connection: "Reddit", verifierIdField: "name", isVerifierIdCaseSensitive: false },
    };
  };
}
