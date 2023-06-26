export interface ValApiAgentResponse {
  status: number;
  data: {
    uuid: string;
    displayName: string;
    description: string;
    developerName: string;
    characterTags: string[];
    displayIcon: string;
    displayIconSmall: string;
    bustPortrait: string;
    fullPortrait: string;
    fullPortraitV2: string;
    killfeedPortrait: string;
    background: string;
    backgroundGradientColors: string[];
    assetPath: string;
    isFullPortraitRightFacing: boolean;
    isPlayableCharacter: boolean;
    isAvailableForTest: boolean;
    isBaseContent: boolean;
    role: Role;
    abilities: Ability[];
    voiceLine: {
      minDuration: number;
      maxDuration: number;
      mediaList: Media[];
    };
  };
}

export interface Ability {
  slot: string;
  displayName: string;
  description: string;
  displayIcon: string;
}
export interface Role {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string;
  assetPath: string;
}
export interface Media {
  id: number;
  wwise: string;
  wave: string;
}
