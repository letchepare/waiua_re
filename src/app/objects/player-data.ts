import { Skin } from "./skin";
import { SkinUtils } from "../helpers/skin-utils";
import { TierInformation } from "./api-objects/val-api-competitive-tier-response";
import { AgentData } from "./agent-data";
export enum PlayerDataDefaultValues {
  image = "https://media.valorant-api.com/playercards/9fb348bc-41a0-91ad-8a3e-818035c4e561/smallart.png",
  name = "----",
  unratedImage = "",
}

export enum PreGameMatchTeamIds {
  attacker = "Red",
  defender = "Blue",
}
export class PlayerData {
  image: string;
  name: string;
  backgroundColour: string;
  partyColour: string;
  partyUUID: string;
  rank: TierInformation = PlayerData.unratedTierInformation();
  /** Player UUID */
  PUUID: string | undefined;
  skins: Map<string, Skin>; // weapon name / skin infos
  agent?: AgentData;
  accountLevel: number;

  constructor(obj: Partial<PlayerData>) {
    Object.assign(this, obj);
    this.image = PlayerDataDefaultValues.image;
    if (obj.image !== undefined) {
      this.image = `https://media.valorant-api.com/playercards/${obj.image}/smallart.png`;
    }

    this.name = obj.name || PlayerDataDefaultValues.name;
    this.backgroundColour = obj.backgroundColour || "";
    this.partyColour = obj.partyColour || "";
    this.skins = obj.skins || SkinUtils.defaultSkins();
    this.agent = obj.agent || undefined;
    this.accountLevel = obj.accountLevel || 0;
    this.partyUUID = obj.partyUUID || "";
  }
  public setName(name: string): void {
    this.name = name;
  }

  public setSkins(skins: Map<string, Skin>): void {
    this.skins = skins;
  }
  public setSkin(name: string, skin: Skin): void {
    this.skins.set(name, skin);
  }
  public static unratedTierInformation(): TierInformation {
    return {
      tier: 0,
      tierName: "UNRANKED",
      division: "ECompetitiveDivision::UNRANKED",
      divisionName: "UNRANKED",
      color: "ffffffff",
      backgroundColor: "00000000",
      smallIcon:
        "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/0/smallicon.png",
      largeIcon:
        "https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/0/largeicon.png",
      rankTriangleDownIcon: "",
      rankTriangleUpIcon: "",
    };
  }
}
