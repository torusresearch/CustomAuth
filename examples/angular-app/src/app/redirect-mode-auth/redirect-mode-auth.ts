import { ChangeDetectorRef, Component, OnInit } from "@angular/core";

import { CustomAuthService } from "../custom-auth";

@Component({
  selector: "app-redirect-mode-auth",
  imports: [],
  templateUrl: "./redirect-mode-auth.html",
  styleUrl: "./redirect-mode-auth.css",
})
export class RedirectModeAuth implements OnInit {
  status: "idle" | "loading" | "success" | "error" = "idle";
  result = "";
  private readonly redirectTimeoutMs = 10000;
  private completed = false;

  constructor(
    private readonly authService: CustomAuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.hasOAuthResponseParams() && !this.authService.hasPendingRedirectState()) {
      const storedResult = this.authService.getStoredLoginResult();
      if (storedResult) {
        this.status = "success";
        this.result = this.authService.stringifyForDisplay(storedResult);
      } else {
        this.status = "error";
        this.result = "No redirect payload found. Start login again from Redirect Mode and avoid reloading /auth.";
      }
      this.cdr.detectChanges();
      return;
    }

    this.status = "loading";
    const timeoutId = window.setTimeout(() => {
      if (this.completed) return;
      this.completed = true;
      this.status = "error";
      this.result = "Redirect result timed out. Start the Angular app on http://localhost:3000 and try login again.";
      this.cdr.detectChanges();
    }, this.redirectTimeoutMs);

    void this.resolveRedirect(timeoutId);
  }

  private async resolveRedirect(timeoutId: number): Promise<void> {
    try {
      const redirectResult = await this.authService.getRedirectResult();
      if (this.completed) return;

      this.completed = true;
      this.authService.saveLoginResult(redirectResult);
      this.result = redirectResult ? this.authService.stringifyForDisplay(redirectResult) : "No redirect result returned by SDK.";
      this.status = "success";
      this.cdr.detectChanges();
    } catch (error) {
      if (this.completed) return;

      this.completed = true;
      this.result = (error as Error).message;
      this.status = "error";
      this.cdr.detectChanges();
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private hasOAuthResponseParams(): boolean {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const source = `${hash}&${search}`;
    return /(state=|code=|id_token=|access_token=|error=)/.test(source);
  }
}
