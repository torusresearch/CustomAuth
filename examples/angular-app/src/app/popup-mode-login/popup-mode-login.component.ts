import { Component, OnInit } from "@angular/core";
import TorusSdk from "@toruslabs/customauth";

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
  selector: "app-popup-mode-login",
  templateUrl: "./popup-mode-login.component.html",
  styleUrls: ["./popup-mode-login.component.css"],
})
export class PopupModeLoginComponent implements OnInit {
  torusdirectsdk = null;
  selectedVerifier = GOOGLE;
  consoleText = "";

  verifierMap = verifierMap;

  verifierMapKeys = Object.keys(this.verifierMap);

  async ngOnInit() {
    try {
      const torusdirectsdk = new TorusSdk({
        baseUrl: `${location.origin}/serviceworker`,
        enableLogging: true,
        network: "testnet", // details for test net
      });

      await torusdirectsdk.init({ skipSw: false });
      this.torusdirectsdk = torusdirectsdk;
    } catch (error) {
      console.error(error, "oninit caught");
    }
  }

  async login() {
    try {
      const jwtParams = this._loginToConnectionMap()[this.selectedVerifier] || {};
      const { typeOfLogin, clientId, verifier } = this.verifierMap[this.selectedVerifier];
      const loginDetails = await this.torusdirectsdk.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
      });

      this.consoleText = typeof loginDetails === "object" ? JSON.stringify(loginDetails) : loginDetails;
    } catch (error) {
      console.error(error, "login caught");
    }
  }

  onSelectedVerifierChanged = (event) => {
    this.selectedVerifier = event.target.value;
  };

  _loginToConnectionMap = () => {
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
