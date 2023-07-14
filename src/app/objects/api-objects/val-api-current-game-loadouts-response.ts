import {
  WeaponIds,
  weaponDefaultSkinUUIDs,
} from "src/app/helpers/weapon-default-skin-infos.enum";

export interface CurrentGameLoadoutsResponse {
  Loadouts: {
    /** Character ID */
    CharacterID: string;
    Loadout: Loadout;
  }[];
}

export interface Loadout {
  Sprays: {
    SpraySelection: {
      /** UUID */
      SocketID: string;
      /** UUID */
      SprayID: string;
      /** UUID */
      LevelID: string;
    }[];
  };
  Items: {
    [x in WeaponIds]: {
      /** Item ID */
      ID: string;
      /** Item Type ID */
      TypeID: string;
      Sockets: {
        [x: string]: {
          /** UUID */
          ID: string;
          Item: {
            /** Item ID */
            ID: string;
            /** Item Type ID */
            TypeID: string;
          };
        };
      };
    };
  };
}
