import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

import { AppComponent } from "./app.component";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { PopupModeLoginComponent } from "./popup-mode-login/popup-mode-login.component";
import { RedirectModeLoginComponent } from "./redirect-mode-login/redirect-mode-login.component";
import { RedirectModeAuthComponent } from "./redirect-mode-auth/redirect-mode-auth.component";
const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "auth", component: RedirectModeAuthComponent },
  { path: "redirect-mode", component: RedirectModeLoginComponent },
  { path: "popup-mode", component: PopupModeLoginComponent },
];

@NgModule({
  declarations: [AppComponent, HomeComponent, RedirectModeAuthComponent, RedirectModeLoginComponent, PopupModeLoginComponent],
  imports: [BrowserModule, CommonModule, FormsModule, RouterModule.forRoot(routes)],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
