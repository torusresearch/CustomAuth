import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-home",
  imports: [RouterLink],
  templateUrl: "./home.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./home.css",
})
export class Home {}
