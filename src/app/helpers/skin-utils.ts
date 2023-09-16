import { Skin } from "../objects/skin";
import {
  WeaponIds,
  weaponDefaultSkinImages,
  weaponDefaultSkinUUIDs,
} from "./weapon-default-skin-infos.enum";
import { weaponNames } from "./weapon-names.enum";

export class SkinUtils {
  public static defaultSkins(): Map<string, Skin> {
    let defaultSkins = new Map<string, Skin>();

    // SIDEARMS
    defaultSkins.set(
      WeaponIds.classic,
      new Skin(
        weaponDefaultSkinUUIDs.classic,
        `Standard ${weaponNames.classic}`,
        weaponDefaultSkinImages.classic
      )
    );
    defaultSkins.set(
      WeaponIds.shorty,
      new Skin(
        weaponDefaultSkinUUIDs.shorty,
        `Standard ${weaponNames.shorty}`,
        weaponDefaultSkinImages.shorty
      )
    );
    defaultSkins.set(
      WeaponIds.frenzy,
      new Skin(
        weaponDefaultSkinUUIDs.frenzy,
        `Standard ${weaponNames.frenzy}`,
        weaponDefaultSkinImages.frenzy
      )
    );
    defaultSkins.set(
      WeaponIds.ghost,
      new Skin(
        weaponDefaultSkinUUIDs.ghost,
        `Standard ${weaponNames.ghost}`,
        weaponDefaultSkinImages.ghost
      )
    );
    defaultSkins.set(
      WeaponIds.sheriff,
      new Skin(
        weaponDefaultSkinUUIDs.sheriff,
        `Standard ${weaponNames.sheriff}`,
        weaponDefaultSkinImages.sheriff
      )
    );

    // SMGS
    defaultSkins.set(
      WeaponIds.stinger,
      new Skin(
        weaponDefaultSkinUUIDs.stinger,
        `Standard ${weaponNames.stinger}`,
        weaponDefaultSkinImages.stinger
      )
    );
    defaultSkins.set(
      WeaponIds.spectre,
      new Skin(
        weaponDefaultSkinUUIDs.spectre,
        `Standard ${weaponNames.spectre}`,
        weaponDefaultSkinImages.spectre
      )
    );

    // SHOTGUNS
    defaultSkins.set(
      WeaponIds.bucky,
      new Skin(
        weaponDefaultSkinUUIDs.bucky,
        `Standard ${weaponNames.bucky}`,
        weaponDefaultSkinImages.bucky
      )
    );
    defaultSkins.set(
      WeaponIds.judge,
      new Skin(
        weaponDefaultSkinUUIDs.judge,
        `Standard ${weaponNames.judge}`,
        weaponDefaultSkinImages.judge
      )
    );
    // RIFLES
    defaultSkins.set(
      WeaponIds.bulldog,
      new Skin(
        weaponDefaultSkinUUIDs.bulldog,
        `Standard ${weaponNames.bulldog}`,
        weaponDefaultSkinImages.bulldog
      )
    );
    defaultSkins.set(
      WeaponIds.guardian,
      new Skin(
        weaponDefaultSkinUUIDs.guardian,
        `Standard ${weaponNames.guardian}`,
        weaponDefaultSkinImages.guardian
      )
    );
    defaultSkins.set(
      WeaponIds.phantom,
      new Skin(
        weaponDefaultSkinUUIDs.phantom,
        `Standard ${weaponNames.phantom}`,
        weaponDefaultSkinImages.phantom
      )
    );
    defaultSkins.set(
      WeaponIds.vandal,
      new Skin(
        weaponDefaultSkinUUIDs.vandal,
        `Standard ${weaponNames.vandal}`,
        weaponDefaultSkinImages.vandal
      )
    );
    // SNIPERS
    defaultSkins.set(
      WeaponIds.marshal,
      new Skin(
        weaponDefaultSkinUUIDs.marshal,
        `Standard ${weaponNames.marshal}`,
        weaponDefaultSkinImages.marshal
      )
    );
    defaultSkins.set(
      WeaponIds.operator,
      new Skin(
        weaponDefaultSkinUUIDs.operator,
        `Standard ${weaponNames.operator}`,
        weaponDefaultSkinImages.operator
      )
    );

    // HEAVY
    defaultSkins.set(
      WeaponIds.ares,
      new Skin(
        weaponDefaultSkinUUIDs.ares,
        `Standard ${weaponNames.ares}`,
        weaponDefaultSkinImages.ares
      )
    );
    defaultSkins.set(
      WeaponIds.odin,
      new Skin(
        weaponDefaultSkinUUIDs.operator,
        `Standard ${weaponNames.odin}`,
        weaponDefaultSkinImages.odin
      )
    );

    return defaultSkins;
  }
}
