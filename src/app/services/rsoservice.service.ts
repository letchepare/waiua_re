import { Injectable } from "@angular/core";
import { invoke } from "@tauri-apps/api";
import { Buffer } from "buffer";
import { accessToken } from "../objects/api-objects/access-token";
import { EntitlementsTokenResponse } from "../objects/api-objects/entitlement-token-response";
import { appLocalDataDir, resolve } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/api/fs";
import {
  Session,
  SessionsResponse,
} from "../objects/api-objects/session-response";
import { gameResponse } from "../objects/api-objects/game-response";
import { gameType } from "../objects/api-objects/game-type.enum";
import { PreGameMatchResponse } from "../objects/api-objects/pregameMatchResponse";
import { CurrentGameMatchResponse } from "../objects/api-objects/current-game-match-response";
import { NameServiceResponse } from "../objects/api-objects/name-service-response";
import {
  PlayerData,
  PlayerDataDefaultValues,
  PreGameMatchTeamIds,
} from "../objects/player-data";
import { UUID } from "crypto";
import { ValAPIVersionResponse } from "../objects/api-objects/val-api-version-response";
import { CustomHeaderNames, CustomHeaderValues } from "./headers-defaults.enum";
import { FetchContentResponse } from "../objects/api-objects/fetch-content-response";
import { PlayerMMRResponse } from "../objects/api-objects/player-mmr-response";
import {
  TierInformation,
  ValApiCompetitiveTierResponse,
} from "../objects/api-objects/val-api-competitive-tier-response";
import { AgentData } from "../objects/agent-data";
import { ValApiAgentResponse } from "../objects/api-objects/val-api-agent-response";
import {
  PresencePrivate,
  PresencesResponse,
} from "../objects/api-objects/presence-response";

@Injectable({
  providedIn: "root",
})
export class RSOServiceService {
  private lockfilePassword: string | undefined;
  private lockfilePort: string | undefined;
  private accessToken: string | undefined;
  private entitlementToken: string | undefined;
  private region: string | undefined;
  private shard: string | undefined;
  private version: string | undefined;
  private PUUID: string | undefined;
  private partyUUID: string | undefined;
  private pregameId: string | undefined;
  private coreGameId: string | undefined;
  private actId: string | undefined;
  private episodeId: string | undefined;

  constructor() {}

  public async getAccessToken(): Promise<string> {
    if (!this.lockfilePassword || !this.lockfilePort) {
      console.error("no lockfile found");
      return "";
    }

    const headers: Map<string, string> = new Map<string, string>();
    headers.set(
      "Authorization",
      "Basic " + Buffer.from("riot:" + this.lockfilePassword).toString("base64")
    );
    const response: string = await invoke<string>("http_get_basic_auth", {
      url: `https://127.0.0.1:${this.lockfilePort}/rso-auth/v1/authorization/access-token`,
      user: "riot",
      password: this.lockfilePassword,
    });
    const accessToken: accessToken = JSON.parse(response);
    return accessToken.token;
  }

  public async currentSeasonId(): Promise<void> {
    if (!this.version) {
      this.version = await this.getCurrentVersionFromValApi();
    }
    const url = `https://shared.${this.shard}.a.pvp.net/content-service/v3/content`;
    const headers: Map<string, string> = new Map<string, string>();
    headers.set(CustomHeaderNames.riotClientVersion, this.version);
    headers.set(
      CustomHeaderNames.RiotClientPlatform,
      CustomHeaderValues.RiotClientPlatform
    );
    const response = await invoke<string>("http_get", {
      url,
      headers,
    });
    const fetchContentResponse: FetchContentResponse = JSON.parse(response);
    const currentAct = fetchContentResponse.Seasons.find((season) => {
      return season.IsActive && season.Type === "act";
    });
    const currentEpisode = fetchContentResponse.Seasons.find((season) => {
      return season.IsActive && season.Type === "episode";
    });
    if (currentAct && currentAct.ID) {
      this.actId = currentAct.ID;
    }
    if (currentEpisode && currentEpisode.ID) {
      this.episodeId = currentEpisode.ID;
    }
  }

  public async checkLockfile(): Promise<boolean> {
    const appDataPath = await appLocalDataDir();
    const fileFullPath =
      (await resolve(appDataPath, "..")) +
      "/Riot Games/Riot Client/Config/lockfile";
    try {
      const fileText = await readTextFile(fileFullPath);
      const split = fileText.split(":");
      const port = split[2];
      const password = split[3];
      this.lockfilePort = port;
      this.lockfilePassword = password;
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async localLogin() {
    const response = await invoke<string>("http_get_basic_auth", {
      url: `https://127.0.0.1:${this.lockfilePort}/entitlements/v1/token`,
      user: "riot",
      password: this.lockfilePassword,
    });
    const entitlementResponse: EntitlementsTokenResponse = JSON.parse(response);
    this.accessToken = entitlementResponse.accessToken;
    this.entitlementToken = entitlementResponse.token;
    this.PUUID = entitlementResponse.subject;
    `logged as ${this.PUUID}`;
  }

  // Should return void, but any set for interruption return
  public async localRegion(): Promise<any> {
    if (!this.version) {
      this.version = await this.getCurrentVersionFromValApi();
    }
    const headers = new Map<string, string>();
    headers.set(
      CustomHeaderNames.RiotClientPlatform,
      CustomHeaderValues.RiotClientPlatform
    );
    headers.set("X-Riot-ClientVersion", this.version);
    const response = await invoke<string>("http_get_basic_auth", {
      url: `https://127.0.0.1:${this.lockfilePort}/product-session/v1/external-sessions`,
      user: "riot",
      password: this.lockfilePassword,
      headers,
    });
    // parsing session response from the api
    const sessionsResponse: SessionsResponse = JSON.parse(response);
    // parsing response data to an array
    let sessionArray: Session[] = [];
    for (let sessionIndex in sessionsResponse) {
      sessionArray.push(sessionsResponse[sessionIndex]);
    }
    // getting valorant session
    let valorantSession = sessionArray.find((item, index, array) => {
      return item.productId === "valorant";
    });
    valorantSession;
    const region =
      valorantSession?.launchConfiguration.arguments[4].split("=")[1];
    switch (region) {
      case "latam":
        (this.region = "na"), (this.shard = "latam");
        break;
      case "br":
        this.region = "na";
        this.shard = "br";
        break;
      default:
        this.region = region;
        this.shard = region;
    }
  }
  async getCurrentVersionFromValApi(): Promise<string> {
    const headers = new Map<string, string>();
    const response = await invoke<string>("http_get", {
      url: "https://valorant-api.com/v1/version",
    });
    const valAPIVersionResponse: ValAPIVersionResponse = JSON.parse(response);
    const version = `${valAPIVersionResponse.data.riotClientVersion}`;

    return version;
  }

  public async checkLogin(): Promise<boolean> {
    let headers = new Map<string, string>();
    headers.set("X-Riot-Entitlements-JWT", this.entitlementToken || "");
    try {
      const response = await invoke<string>("http_get_bearer_auth", {
        url: `https://pd.${this.region}.a.pvp.net/account-xp/v1/players/${this.PUUID}`,
        bearer: this.accessToken,
        headers,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  public async checkMatch(): Promise<gameType> {
    let headers = new Map<string, string>();
    headers.set("X-Riot-Entitlements-JWT", this.entitlementToken || "");
    try {
      const response = await invoke<string>("http_get_bearer_auth", {
        url: `https://glz-${this.shard}-1.${this.region}.a.pvp.net/core-game/v1/players/${this.PUUID}`,
        bearer: this.accessToken,
        headers,
      });
      const game: gameResponse = JSON.parse(response);
      this.coreGameId = game.MatchID;
      this.pregameId = undefined;
      return gameType.core;
    } catch (e) {
      // no started game yet, fetching for pregame
      try {
        const response = await invoke<string>("http_get_bearer_auth", {
          url: `https://glz-${this.shard}-1.${this.region}.a.pvp.net/pregame/v1/players/${this.PUUID}`,
          bearer: this.accessToken,
          headers,
        });
        const game: gameResponse = JSON.parse(response);
        this.pregameId = game.MatchID;
        return gameType.pregame;
      } catch (e) {
        this.pregameId = undefined;
        this.coreGameId = undefined;

        return gameType.none;
      }
    }
  }

  public async getPregameInfos(): Promise<
    | {
        redTeamPlayerData: PlayerData[];
        blueTeamPlayerData: PlayerData[];
      }
    | false
  > {
    if (!this.pregameId) return false;

    let blueTeamPlayerData: PlayerData[] = [];
    let redTeamPlayerData: PlayerData[] = [];
    let headers = new Map<string, string>();
    headers.set("X-Riot-Entitlements-JWT", this.entitlementToken || "");
    try {
      const response = await invoke<string>("http_get_bearer_auth", {
        url: `https://glz-${this.region}-1.${this.shard}.a.pvp.net/pregame/v1/matches/${this.pregameId}`,
        bearer: this.accessToken,
        headers,
      });
      const pregameMatchResponse: PreGameMatchResponse = JSON.parse(response);
      const allyTeam = pregameMatchResponse.AllyTeam;
      const allyTeamUUIDs = allyTeam!.Players.map((p) => p.Subject);
      const playerNames = await this.getUserNamesByPUUIDs(allyTeamUUIDs);
      const playerNamesMap = new Map<string, string>();
      playerNames.forEach((name) =>
        playerNamesMap.set(name.Subject, name.GameName + "#" + name.TagLine)
      );
      if (allyTeam?.TeamID === PreGameMatchTeamIds.defender) {
        blueTeamPlayerData = allyTeam!.Players.map((player) => {
          const puuid = player.Subject;
          const name = playerNamesMap.get(puuid) || "----";
          return new PlayerData({
            PUUID: puuid,
            image: player.PlayerIdentity.PlayerCardID,
            partyUUID: this.partyUUID,
            name: name,
            accountLevel: player.PlayerIdentity.AccountLevel,
          });
        });
      }
      if (allyTeam?.TeamID === PreGameMatchTeamIds.attacker) {
        redTeamPlayerData = allyTeam!.Players.map((player) => {
          const puuid = player.Subject;
          const name = playerNamesMap.get(puuid) || "----";
          return new PlayerData({
            PUUID: puuid,
            image: player.PlayerIdentity.PlayerCardID,
            partyUUID: this.partyUUID,
            name: name,
            accountLevel: player.PlayerIdentity.AccountLevel,
          });
        });
      }
      return {
        redTeamPlayerData,
        blueTeamPlayerData,
      };
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  public async getRankByPuuidAndSeasonId(
    puuid: string,
    seasonId: string
  ): Promise<number | false> {
    if (!this.actId || !this.version) return false;
    let headers = new Map<string, string>();
    headers.set("X-Riot-Entitlements-JWT", this.entitlementToken || "");
    headers.set(
      CustomHeaderNames.RiotClientPlatform,
      CustomHeaderValues.RiotClientPlatform
    );
    headers.set(CustomHeaderNames.riotClientVersion, this.version);
    try {
      const response = await invoke<string>("http_get_bearer_auth", {
        url: `https://pd.${this.shard}.a.pvp.net/mmr/v1/players/${puuid}`,
        bearer: this.accessToken,
        headers,
      });
      const playerMMRResponse: PlayerMMRResponse = JSON.parse(response);
      for (const key in playerMMRResponse.QueueSkills.competitive
        .SeasonalInfoBySeasonID) {
        const season =
          playerMMRResponse.QueueSkills.competitive.SeasonalInfoBySeasonID[key];
        if (season.SeasonID === seasonId) {
          return season.CompetitiveTier;
        }
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Find current rank number
   * @param puuid user unique id
   * @returns current rank number in valorant api of false if not found or error
   */
  public async getCurrentRankByPuuid(puuid: string): Promise<number | false> {
    if (this.actId === undefined) {
      return false;
    }
    return this.getRankByPuuidAndSeasonId(puuid, this.actId);
  }
  public async getCoreGamePlayerDatas(): Promise<
    | {
        redTeamPlayerData: PlayerData[];
        blueTeamPlayerData: PlayerData[];
      }
    | false
  > {
    if (!this.coreGameId) return false;
    let headers = new Map<string, string>();
    headers.set("X-Riot-Entitlements-JWT", this.entitlementToken || "");
    try {
      const response = await invoke<string>("http_get_bearer_auth", {
        url: `https://glz-${this.region}-1.${this.shard}.a.pvp.net/core-game/v1/matches/${this.coreGameId}`,
        bearer: this.accessToken,
        headers,
      });
      const currentGameMatchResponse: CurrentGameMatchResponse =
        JSON.parse(response);
      let blueTeam = currentGameMatchResponse.Players.filter(
        (player) => player.TeamID === PreGameMatchTeamIds.defender
      );
      let redTeam = currentGameMatchResponse.Players.filter(
        (player) => player.TeamID === PreGameMatchTeamIds.attacker
      );
      const blueteamUUIDs = blueTeam.map((player) => player.Subject);
      const blueTeamNames = await this.getUserNamesByPUUIDs(blueteamUUIDs);
      const blueTeamNamesMap = new Map<string, string>();
      blueTeamNames.forEach((name) =>
        blueTeamNamesMap.set(name.Subject, name.GameName + "#" + name.TagLine)
      );
      const blueTeamPlayerData: PlayerData[] = blueTeam.map((player) => {
        const puuid = player.Subject;
        const name = blueTeamNamesMap.get(puuid) || "----";
        return new PlayerData({
          PUUID: puuid,
          image: player.PlayerIdentity.PlayerCardID,
          partyUUID: this.partyUUID,
          name: name,
          agent: { uuid: player.CharacterID },
          accountLevel: player.PlayerIdentity.AccountLevel,
        });
      });
      const redTeamUUIDs = redTeam.map((player) => player.Subject);
      const redTeamNames = await this.getUserNamesByPUUIDs(redTeamUUIDs);
      const redTeamNamesMap = new Map<string, string>();
      redTeamNames.forEach((name) =>
        redTeamNamesMap.set(name.Subject, name.GameName + "#" + name.TagLine)
      );
      const redTeamPlayerData: PlayerData[] = redTeam.map((player) => {
        const puuid = player.Subject;
        const name = redTeamNamesMap.get(puuid) || "----";
        return new PlayerData({
          PUUID: puuid,
          image: player.PlayerIdentity.PlayerCardID,
          partyUUID: this.partyUUID,
          name: name,
          agent: { uuid: player.CharacterID },
          accountLevel: player.PlayerIdentity.AccountLevel,
        });
      });
      return { redTeamPlayerData, blueTeamPlayerData };
    } catch (e) {
      throw e;
    }
  }

  public async getUserNamesByPUUIDs(
    PUUIDs: string[]
  ): Promise<NameServiceResponse[]> {
    let headers = new Map<string, string>();
    headers.set("X-Riot-Entitlements-JWT", this.entitlementToken || "");
    try {
      const response = await invoke<string>("http_put_bearer_auth", {
        url: `https://pd.${this.shard}.a.pvp.net/name-service/v2/players`,
        bearer: this.accessToken,
        body: JSON.stringify(PUUIDs),
        headers,
      });

      const userNames: NameServiceResponse[] = JSON.parse(response);
      return userNames;
    } catch (e) {
      return [];
    }
  }

  public async getRankInformations(rank: number): Promise<TierInformation> {
    // throw new Error("Method not implemented.");
    const url = "https://valorant-api.com/v1/competitivetiers";
    const response = await invoke<string>("http_get", {
      url,
    });
    const competitiveTiers: ValApiCompetitiveTierResponse =
      JSON.parse(response);
    const competitiveTiersLastIndex = competitiveTiers.data.length - 1;
    const tier = competitiveTiers.data[competitiveTiersLastIndex];
    const tierRank = tier.tiers.find((tier) => tier.tier === rank);
    if (!tierRank) return PlayerData.unratedTierInformation();
    return tierRank;
  }

  async getAgent(uuid: string): Promise<AgentData> {
    const response = await invoke<string>("http_get", {
      url: `https://valorant-api.com/v1/agents/${uuid}`,
    });
    const agentDataResponse: ValApiAgentResponse = JSON.parse(response);
    const agentData: AgentData = {
      displayIcon: agentDataResponse.data.displayIcon,
      displayIconSmall: agentDataResponse.data.displayIconSmall,
      displayName: agentDataResponse.data.displayName,
      uuid: agentDataResponse.data.uuid,
    };
    return agentData;
  }

  async getPresences(puuid: string): Promise<PresencePrivate | false> {
    const urlPresences = `https://127.0.0.1:${this.lockfilePort}/chat/v4/presences`;
    try {
      const response = await invoke<string>("http_get_basic_auth", {
        url: urlPresences,
        user: "riot",
        password: this.lockfilePassword,
      });

      const presencesResponse: PresencesResponse = JSON.parse(response);

      const userPresence = presencesResponse.presences.find(
        (presence) => presence.puuid == puuid
      );
      if (!userPresence) {
        return false;
      }
      const privateData: PresencePrivate = JSON.parse(
        atob(userPresence.private)
      );
      return privateData;
    } catch (e) {
      console.error(e);
      return false;
    }
    // throw new Error("Method not implemented.");
  }
}