import { Component, OnInit } from "@angular/core";
import TorusSdk from "@toruslabs/customauth";

@Component({
  selector: "app-redirect-mode-auth",
  templateUrl: "./redirect-mode-auth.component.html",
  styleUrls: ["./redirect-mode-auth.component.css"],
})
export class RedirectModeAuthComponent implements OnInit {
  consoleText = "";

  async ngOnInit(): Promise<void> {
    const torusdirectsdk = new TorusSdk({
      baseUrl: window.location.origin,
      redirectPathName: "auth",
      enableLogging: true,
      uxMode: "redirect",
      network: "testnet",
    });
    const loginDetails = await torusdirectsdk.getRedirectResult();
    this.consoleText = typeof loginDetails === "object" ? JSON.stringify(loginDetails) : loginDetails;
  }
}
