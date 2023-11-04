import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import {
  faArrowsRotate,
  faCog,
  faInfo,
} from "@fortawesome/free-solid-svg-icons";
import { http } from "@tauri-apps/api";
import { PlayerData } from "./objects/player-data";
import { RSOServiceService } from "./services/rsoservice.service";
import { gameType } from "./objects/api-objects/game-type.enum";
import { SwalComponent } from "@sweetalert2/ngx-sweetalert2/public-api";
import { ToastrService, IndividualConfig } from "ngx-toastr";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements AfterViewInit, OnInit {
  @ViewChild("loadingData")
  public readonly loadingData!: SwalComponent;

  faCog = faCog;
  faInfo = faInfo;
  faRefresh = faArrowsRotate;
  atkPlayerList: PlayerData[] = []; // mockup use for now
  defPlayerList: PlayerData[] = []; // mockup use for now
  greetingMessage = "";
  agentsList: Array<any> = [];

  refreshInfosTimer: any;

  TOASTR_MESSAGE_OPTIONS: Partial<IndividualConfig> = {
    progressBar: true,
    positionClass: "toast-top-center",
    closeButton: true,
  };

  constructor(
    private RSOService: RSOServiceService,
    private toastr: ToastrService
  ) {}

  ngAfterViewInit() {}
  ngOnInit() {
    for (let i = 1; i <= 5; i++) {
      let playerData = new PlayerData({ name: `Player ${i}` });
      if (i == 1) {
        playerData.image =
          "https://media.valorant-api.com/playercards/eba5be7e-4ec7-753b-8678-fa88da1e46ab/displayicon.png";
      }
      this.atkPlayerList.push(playerData);
    }
    for (let i = 1; i <= 5; i++) {
      this.defPlayerList.push(new PlayerData({ name: `Player ${i}` }));
    }

    // this.createUpdateTimer();
  }

  createUpdateTimer() {
    this.refreshInfosTimer = setInterval(() => this.updateChecks(), 60000);
  }
  clickedPauseTimer() {
    if (this.refreshInfosTimer) clearInterval(this.refreshInfosTimer);
    else this.createUpdateTimer();
  }
  async updateChecks(): Promise<false | void> {
    // open loading overlay
    this.loadingData.fire();
    if (!(await this.RSOService.checkLockfile())) {
      return false;
    }
    try {
      await this.RSOService.localLogin();
      await this.RSOService.localRegion();
      await this.RSOService.getSeasonIds();
      let matchStatus = await this.RSOService.checkMatch();
      switch (matchStatus) {
        case gameType.core:
          const coreGamePlayerDatas = await this.RSOService.getCoreGamePlayerDatas();
          if (coreGamePlayerDatas !== false) {
            const redTeam =
              coreGamePlayerDatas.redTeamPlayerData.length > 0
                ? coreGamePlayerDatas.redTeamPlayerData
                : [];
            const blueTeam =
              coreGamePlayerDatas.blueTeamPlayerData.length > 0
                ? coreGamePlayerDatas.blueTeamPlayerData
                : [];
            for (let bluePlayerData of blueTeam) {
              if (bluePlayerData.PUUID) {
                const rank = await this.RSOService.getCurrentRankByPuuid(
                  bluePlayerData.PUUID
                );
                // rank 0 is unrated
                // rank 1 and 2 are "unused"
                if (rank && rank > 2) {
                  const rankInformations = await this.RSOService.getRankInformations(
                    rank
                  );
                  bluePlayerData.rank = rankInformations;
                }

                const presence = await this.RSOService.getPresences(
                  bluePlayerData.PUUID
                );
                if (presence) {
                  bluePlayerData.partyUUID = presence.partyId;
                }
              }
              if (bluePlayerData.agent?.uuid) {
                const agent = await this.RSOService.getAgent(
                  bluePlayerData.agent.uuid
                );
                bluePlayerData.agent = agent;
              }
            }
            for (let redPlayerData of redTeam) {
              if (redPlayerData.PUUID) {
                const rank = await this.RSOService.getCurrentRankByPuuid(
                  redPlayerData.PUUID
                );
                // rank 0 is unrated
                // rank 1 and 2 are "unused"
                if (rank && rank > 2) {
                  const rankInformations = await this.RSOService.getRankInformations(
                    rank
                  );
                  redPlayerData.rank = rankInformations;
                }

                const presence = await this.RSOService.getPresences(
                  redPlayerData.PUUID
                );
                if (presence) {
                  redPlayerData.partyUUID = presence.partyId;
                }
              }
              if (redPlayerData.agent?.uuid) {
                const agent = await this.RSOService.getAgent(
                  redPlayerData.agent.uuid
                );
                redPlayerData.agent = agent;
              }
            }

            for (const player of blueTeam) {
              // fetch 3 previous ranks
              await this.RSOService.getPlayerHistory(player);
              await this.RSOService.getMatchHistory(player);
            }
            for (const player of redTeam) {
              // fetch 3 previous ranks
              await this.RSOService.getPlayerHistory(player);
              await this.RSOService.getMatchHistory(player);
            }
            this.defPlayerList = blueTeam;
            this.atkPlayerList = redTeam;
          }
          break;
        case gameType.pregame:
          const preGamePlayerDatas = await this.RSOService.getPregameInfos();
          if (!preGamePlayerDatas) {
            break;
          }
          this.defPlayerList =
            preGamePlayerDatas.blueTeamPlayerData.length > 0
              ? preGamePlayerDatas.blueTeamPlayerData
              : [];

          this.atkPlayerList =
            preGamePlayerDatas.redTeamPlayerData.length > 0
              ? preGamePlayerDatas.redTeamPlayerData
              : [];

          for (let defPlayerData of this.defPlayerList) {
            if (defPlayerData.PUUID) {
              const rank = await this.RSOService.getCurrentRankByPuuid(
                defPlayerData.PUUID
              );
              // rank 0 is unrated
              // rank 1 and 2 are "unused"
              if (rank && rank > 2) {
                const rankInformations = await this.RSOService.getRankInformations(
                  rank
                );
                defPlayerData.rank = rankInformations;
              }
              const presence = await this.RSOService.getPresences(
                defPlayerData.PUUID
              );
              if (presence) {
                defPlayerData.partyUUID = presence.partyId;
              }
            }

            await this.RSOService.getPlayerHistory(defPlayerData);
            await this.RSOService.getMatchHistory(defPlayerData);
          }
          for (let atkPlayerData of this.atkPlayerList) {
            if (atkPlayerData.PUUID) {
              const rank = await this.RSOService.getCurrentRankByPuuid(
                atkPlayerData.PUUID
              );
              // rank 0 is unrated
              // rank 1 and 2 are "unused"
              if (rank && rank > 2) {
                const rankInformations = await this.RSOService.getRankInformations(
                  rank
                );
                atkPlayerData.rank = rankInformations;
              }
              const presence = await this.RSOService.getPresences(
                atkPlayerData.PUUID
              );
              if (presence) {
                atkPlayerData.partyUUID = presence.partyId;
              }
            }

            await this.RSOService.getPlayerHistory(atkPlayerData);
            await this.RSOService.getMatchHistory(atkPlayerData);
          }

          break;
        default:
          this.toastr.warning("", "No game found", this.TOASTR_MESSAGE_OPTIONS);
          this.loadingData.close();
          return false;
      }
      this.toastr.success("", "Game found", this.TOASTR_MESSAGE_OPTIONS);

      // set party colors by party ids
      this.setPartyIds();
      // close loading overlay
      this.loadingData.close();
    } catch (e) {
      console.error(e);
      this.toastr.error(
        "",
        "Error While fetching data",
        this.TOASTR_MESSAGE_OPTIONS
      );
      this.loadingData.close();
    }
  }
  setPartyIds() {
    let colors = [
      "Red",
      "#32e2b2",
      "DarkOrange",
      "White",
      "DeepSkyBlue",
      "MediumPurple",
      "SaddleBrown",
    ];
    this.defPlayerList.forEach((defenser) => {
      if (defenser.partyColour !== "") {
        return;
      }
      const partyId = defenser.partyUUID;
      const partyMembers = this.defPlayerList.filter((player) => {
        return player.partyUUID === partyId;
      });
      if (partyMembers.length > 1) {
        partyMembers.forEach((partyMember) => {
          partyMember.partyColour = colors[0];
        });
        colors.splice(0, 1);
      }
    });
    this.atkPlayerList.forEach((defenser) => {
      if (defenser.partyColour !== "") {
        return;
      }
      const partyId = defenser.partyUUID;
      const partyMembers = this.atkPlayerList.filter((player) => {
        return player.partyUUID === partyId;
      });
      if (partyMembers.length > 1) {
        partyMembers.forEach((partyMember) => {
          partyMember.partyColour = colors[0];
        });
        colors.splice(0, 1);
      }
    });
  }
  showAgentList(event: SubmitEvent): void {
    event.preventDefault();

    http
      .fetch(
        "https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=fr-FR"
      )
      .then((res: any) => {
        this.agentsList = res.data.data as any;
      })
      .catch((e) => console.error(e));
  }

  clickedForceRefresh() {
    this.updateChecks();
  }
}
