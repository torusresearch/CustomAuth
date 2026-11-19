import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, RouterLink],
  templateUrl: "./app.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./app.css",
})
export class App {}
