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
import { SeasonName } from "../helpers/season-name.enum";
import {
  CompetitiveUpdatesResponse,
  MatchUpdate,
} from "../objects/api-objects/val-api-competitive-updates-response";
import {
  CurrentGameLoadoutsResponse,
  Loadout,
} from "../objects/api-objects/val-api-current-game-loadouts-response";
import {
  WeaponIds,
  weaponDefaultSkinUUIDs,
} from "../helpers/weapon-default-skin-infos.enum";
import { SkinChromasResponse } from "../objects/api-objects/val-api-skin-chromas-response";
import { Skin } from "../objects/skin";

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
  private episodeId: string | undefined;
  // Information about current and past seasons
  private seasonData: Map<SeasonName, string> = new Map();

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

  public async getSeasonIds(): Promise<void> {
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
    headers.set("X-Riot-Entitlements-JWT", this.entitlementToken || "");
    const response = await invoke<string>("http_get_bearer_auth", {
      url,
      bearer: this.accessToken,
      headers,
    });
    const fetchContentResponse: FetchContentResponse = JSON.parse(response);
    let currentActIndex = 0;
    const currentAct = fetchContentResponse.Seasons.find((season, index) => {
      if (!season.IsActive || season.Type !== "act") return false;
      currentActIndex = index - 1;
      return season;
    });
    let previousRankIndex = 0;
    while (currentActIndex >= 0 && previousRankIndex < 3) {
      const season = fetchContentResponse.Seasons[currentActIndex];
      currentActIndex--;
      if (season.Type === "act") {
        switch (previousRankIndex) {
          case 0:
            this.seasonData.set(SeasonName.thirdPreviousSeason, season.ID);
            break;
          case 1:
            this.seasonData.set(SeasonName.secondPreviousSeason, season.ID);
            break;
          case 2:
            this.seasonData.set(SeasonName.firstPreviousSeason, season.ID);
            break;
        }
        previousRankIndex++;
      }
    }
    const currentEpisode = fetchContentResponse.Seasons.find((season) => {
      return season.IsActive && season.Type === "episode";
    });
    if (currentAct && currentAct.ID) {
      this.seasonData.set(SeasonName.currentSeason, currentAct.ID);
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
  }

  public async localRegion(): Promise<void> {
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
    const region = valorantSession?.launchConfiguration.arguments[4].split(
      "="
    )[1];
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
    let headers = await this.getDefaultHeaders();
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
    let headers = await this.getDefaultHeaders();
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
        headers.set("X-Riot-Entitlements-JWT", this.entitlementToken || "");
        headers.set(
          "X-Riot-ClientPlatform",
          "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9"
        );
        headers.set("X-Riot-ClientVersion", this.version);
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
        console.error(e);

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
    let headers = await this.getDefaultHeaders();
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
    if (!this.seasonData.get(SeasonName.currentSeason) || !this.version)
      return false;
    let headers = await this.getDefaultHeaders();
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
    const currentSeason = this.seasonData.get(SeasonName.currentSeason);
    if (currentSeason === undefined) {
      return false;
    }
    return this.getRankByPuuidAndSeasonId(puuid, currentSeason);
  }
  public async getCoreGamePlayerDatas(): Promise<
    | {
        redTeamPlayerData: PlayerData[];
        blueTeamPlayerData: PlayerData[];
      }
    | false
  > {
    if (!this.coreGameId) return false;
    let headers = await this.getDefaultHeaders();
    try {
      const response = await invoke<string>("http_get_bearer_auth", {
        url: `https://glz-${this.region}-1.${this.shard}.a.pvp.net/core-game/v1/matches/${this.coreGameId}`,
        bearer: this.accessToken,
        headers,
      });
      const currentGameMatchResponse: CurrentGameMatchResponse = JSON.parse(
        response
      );
      const players: PlayerData[] = currentGameMatchResponse.Players.map(
        (player) => {
          const puuid = player.Subject;
          return new PlayerData({
            PUUID: puuid,
            image: player.PlayerIdentity.PlayerCardID,
            partyUUID: this.partyUUID,
            agent: { uuid: player.CharacterID },
            accountLevel: player.PlayerIdentity.AccountLevel,
            teamId: player.TeamID,
          });
        }
      );
      this.setSkins(players);
      let blueTeamPlayerData = players.filter(
        (player) => player.teamId === PreGameMatchTeamIds.defender
      );
      let redTeamPlayerData = players.filter(
        (player) => player.teamId === PreGameMatchTeamIds.attacker
      );
      const blueteamUUIDs = blueTeamPlayerData.map((player) => player.PUUID!);
      const blueTeamNames = await this.getUserNamesByPUUIDs(blueteamUUIDs);
      const blueTeamNamesMap = new Map<string, string>();
      blueTeamNames.forEach((name) =>
        blueTeamNamesMap.set(name.Subject, name.GameName + "#" + name.TagLine)
      );
      blueTeamPlayerData.forEach((player) => {
        player.name = blueTeamNamesMap.get(player.PUUID!) || "----";
      });

      const redTeamUUIDs = redTeamPlayerData.map((player) => player.PUUID!);
      const redTeamNames = await this.getUserNamesByPUUIDs(redTeamUUIDs);
      const redTeamNamesMap = new Map<string, string>();
      redTeamNames.forEach((name) =>
        redTeamNamesMap.set(name.Subject, name.GameName + "#" + name.TagLine)
      );

      redTeamPlayerData.forEach((player) => {
        player.name = redTeamNamesMap.get(player.PUUID!) || "----";
      });
      return { redTeamPlayerData, blueTeamPlayerData };
    } catch (e) {
      throw e;
    }
  }

  public async getUserNamesByPUUIDs(
    PUUIDs: string[]
  ): Promise<NameServiceResponse[]> {
    let headers = await this.getDefaultHeaders();
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
    const url = "https://valorant-api.com/v1/competitivetiers";
    const response = await invoke<string>("http_get", {
      url,
    });
    const competitiveTiers: ValApiCompetitiveTierResponse = JSON.parse(
      response
    );
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
      if (userPresence.private) {
        const privateData: PresencePrivate = JSON.parse(
          atob(userPresence.private)
        );
        return privateData;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public getSeasonMap(): Map<SeasonName, string> {
    return this.seasonData;
  }

  async getPlayerHistory(player: PlayerData): Promise<any> {
    const url = `https://pd.${this.shard}.a.pvp.net/mmr/v1/players/${player.PUUID}`;
    const playerRankInfo: Map<string, TierInformation> = new Map();
    // get MMR infos
    let headers = await this.getDefaultHeaders();
    const response = await invoke<string>("http_get_bearer_auth", {
      url: url,
      bearer: this.accessToken,
      headers,
    }).catch((e) => {
      console.error(e);
      throw e;
    });
    if (!response) return false;
    const playerMMRResponse: PlayerMMRResponse = JSON.parse(response);

    const compData = playerMMRResponse.QueueSkills.competitive;
    if (!compData || !compData.SeasonalInfoBySeasonID) {
      player.previousRanks.set(0, PlayerData.unratedTierInformation());
      player.previousRanks.set(1, PlayerData.unratedTierInformation());
      player.previousRanks.set(2, PlayerData.unratedTierInformation());
      return false;
    }

    const firstPreviousSeasonCompetitiveTier =
      compData.SeasonalInfoBySeasonID[
        this.seasonData.get(SeasonName.firstPreviousSeason)!
      ]?.CompetitiveTier || 0;
    const secondPreviousSeasonCompetitiveTier =
      compData.SeasonalInfoBySeasonID[
        this.seasonData.get(SeasonName.secondPreviousSeason)!
      ]?.CompetitiveTier || 0;
    const thirdPreviousSeasonCompetitiveTier =
      compData.SeasonalInfoBySeasonID[
        this.seasonData.get(SeasonName.thirdPreviousSeason)!
      ]?.CompetitiveTier || 0;

    const firstPreviousSeasonTierInformation = await this.getRankInformations(
      firstPreviousSeasonCompetitiveTier
    );
    const secondPreviousSeasonTierInformation = await this.getRankInformations(
      secondPreviousSeasonCompetitiveTier
    );
    const thirdPreviousSeasonTierInformation = await this.getRankInformations(
      thirdPreviousSeasonCompetitiveTier
    );
    player.previousRanks.set(0, firstPreviousSeasonTierInformation);
    player.previousRanks.set(1, secondPreviousSeasonTierInformation);
    player.previousRanks.set(2, thirdPreviousSeasonTierInformation);
  }

  async getMatchHistory(player: PlayerData): Promise<void> {
    const url = `https://pd.${this.region}.a.pvp.net/mmr/v1/players/${player.PUUID}/competitiveupdates?queue=competitive`;
    let headers = await this.getDefaultHeaders();
    const response = await invoke<string>("http_get_bearer_auth", {
      url: url,
      bearer: this.accessToken,
      headers,
    });
    const competitiveUpdatesResponse: CompetitiveUpdatesResponse = JSON.parse(
      response
    );
    const matches: MatchUpdate[] = competitiveUpdatesResponse.Matches;
    if (matches.length > 2) {
      player.matchHistory.set(2, matches[0]);
      player.matchHistory.set(1, matches[1]);
      player.matchHistory.set(0, matches[2]);
    }
    if (matches.length === 2) {
      player.matchHistory.set(1, matches[0]);
      player.matchHistory.set(0, matches[1]);
    }
    if (matches.length === 1) {
      player.matchHistory.set(0, matches[0]);
    }
    if (matches.length === 0) {
      player.matchHistory = player.defaultMatchHistory();
    }
  }

  async setSkins(players: PlayerData[]): Promise<void> {
    const skinSocketId = "3ad1b2b2-acdb-4524-852f-954a76ddae0a";
    const skinUrlInfos = "https://valorant-api.com/v1/weapons/skinchromas";
    const url = `https://glz-${this.region}-1.${this.shard}.a.pvp.net/core-game/v1/matches/${this.coreGameId}/loadouts`;
    let headers = await this.getDefaultHeaders();
    const response = await invoke<string>("http_get_bearer_auth", {
      url: url,
      bearer: this.accessToken,
      headers,
    });
    const currentGameLoadoutsResponse: CurrentGameLoadoutsResponse = JSON.parse(
      response
    );
    let index = 0;
    for (let item of currentGameLoadoutsResponse.Loadouts) {
      // find skins infos
      const weaponIds = Object.values(WeaponIds);
      for (const weaponId of weaponIds) {
        const skinId =
          item.Loadout.Items[weaponId].Sockets[skinSocketId].Item.ID;
        const response = await invoke<string>("http_get", {
          url: `${skinUrlInfos}/${skinId}`,
        });

        const SkinChromasResponse: SkinChromasResponse = JSON.parse(response);

        const skin: Skin = new Skin(
          SkinChromasResponse.data.uuid,
          SkinChromasResponse.data.displayName,
          SkinChromasResponse.data.fullRender
        );
        players[index].skins.set(weaponId, skin);
      }

      // next player
      index++;
    }
  }

  private async getDefaultHeaders() {
    if (!this.version) {
      this.version = await this.getCurrentVersionFromValApi();
    }
    let headers = new Map<string, string>();
    headers.set("X-Riot-Entitlements-JWT", this.entitlementToken || "");
    headers.set(
      CustomHeaderNames.RiotClientPlatform,
      CustomHeaderValues.RiotClientPlatform
    );
    headers.set(CustomHeaderNames.riotClientVersion, this.version);
    return headers;
  }
}
