import { AfterViewInit, Component } from "@angular/core";
import { faCog, faInfo } from "@fortawesome/free-solid-svg-icons";
import { http } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/tauri";
// import axios from "axios";
import { Buffer } from "buffer";
// const https = require("https"); // node
// require("dotenv").config();
// console.log(process.env);

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  faCog = faCog;
  faInfo = faInfo;
  greetingMessage = "";
  agentsList: Array<any> = [];

  refreshInfosTimer: any;

  constructor() {}

  afficheListAgents(event: SubmitEvent): void {
    event.preventDefault();
    console.log("clicked");

    http
      .fetch(
        "https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=fr-FR"
      )
      .then((res: any) => {
        this.agentsList = res.data.data as any;
      })
      .catch((e) => console.error(e));
  }
}
