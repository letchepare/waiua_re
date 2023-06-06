import { Component, Input } from "@angular/core";
import { invoke } from "@tauri-apps/api";

@Component({
  selector: "app-player-card",
  templateUrl: "./player-card.component.html",
  styleUrls: ["./player-card.component.css"],
})
export class PlayerCardComponent {
  @Input() name: string = "";
  @Input() agent: string = "";

  clickedSkin(skinName: string) {
    console.log(skinName);
    invoke("custom_log", { text: "skin clicked: " + skinName });
  }

  localLogin() {}

  
}
