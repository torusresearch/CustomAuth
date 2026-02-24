import { Routes } from "@angular/router";

import { Home } from "./home/home";
import { PopupModeLogin } from "./popup-mode-login/popup-mode-login";
import { RedirectModeAuth } from "./redirect-mode-auth/redirect-mode-auth";
import { RedirectModeLogin } from "./redirect-mode-login/redirect-mode-login";

export const routes: Routes = [
  { path: "", component: Home },
  { path: "popup-mode", component: PopupModeLogin },
  { path: "redirect-mode", component: RedirectModeLogin },
  { path: "auth", component: RedirectModeAuth },
];
