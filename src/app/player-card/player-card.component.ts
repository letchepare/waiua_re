import { Component, Input } from "@angular/core";
import { invoke } from "@tauri-apps/api";
import { PlayerData } from "../objects/player-data";
import { weaponNames } from "../helpers/weapon-names.enum";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { WeaponIds } from "../helpers/weapon-default-skin-infos.enum";

@Component({
  selector: "app-player-card",
  templateUrl: "./player-card.component.html",
  styleUrls: ["./player-card.component.css"],
})
export class PlayerCardComponent {
  faUsers = faUsers;
  WeaponIds = WeaponIds;
  @Input() playerData: PlayerData = new PlayerData({});
  @Input() name: string = "";
  @Input() agent: string = "";

  clickedSkin(skinName: string) {
    invoke("custom_log", { text: "skin clicked: " + skinName });
  }

  localLogin() {}
}
