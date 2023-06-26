import { Skin } from "../objects/skin";
import {
  weaponDefaultSkinImages,
  weaponDefaultSkinUUIDs,
} from "./weapon-default-skin-infos.enum";
import { weaponNames } from "./weapon-names.enum";

export class SkinUtils {
  public static defaultSkins(): Map<string, Skin> {
    let defaultSkins = new Map<string, Skin>();

    // SIDEARMS
    defaultSkins.set(
      weaponNames.classic,
      new Skin(
        weaponDefaultSkinUUIDs.classic,
        `Standard ${weaponNames.classic}`,
        weaponDefaultSkinImages.classic
      )
    );
    defaultSkins.set(
      weaponNames.shorty,
      new Skin(
        weaponDefaultSkinUUIDs.shorty,
        `Standard ${weaponNames.shorty}`,
        weaponDefaultSkinImages.shorty
      )
    );
    defaultSkins.set(
      weaponNames.frenzy,
      new Skin(
        weaponDefaultSkinUUIDs.frenzy,
        `Standard ${weaponNames.frenzy}`,
        weaponDefaultSkinImages.frenzy
      )
    );
    defaultSkins.set(
      weaponNames.ghost,
      new Skin(
        weaponDefaultSkinUUIDs.ghost,
        `Standard ${weaponNames.ghost}`,
        weaponDefaultSkinImages.ghost
      )
    );
    defaultSkins.set(
      weaponNames.sheriff,
      new Skin(
        weaponDefaultSkinUUIDs.sheriff,
        `Standard ${weaponNames.sheriff}`,
        weaponDefaultSkinImages.sheriff
      )
    );

    // SMGS
    defaultSkins.set(
      weaponNames.stinger,
      new Skin(
        weaponDefaultSkinUUIDs.stinger,
        `Standard ${weaponNames.stinger}`,
        weaponDefaultSkinImages.stinger
      )
    );
    defaultSkins.set(
      weaponNames.spectre,
      new Skin(
        weaponDefaultSkinUUIDs.spectre,
        `Standard ${weaponNames.spectre}`,
        weaponDefaultSkinImages.spectre
      )
    );

    // SHOTGUNS
    defaultSkins.set(
      weaponNames.bucky,
      new Skin(
        weaponDefaultSkinUUIDs.bucky,
        `Standard ${weaponNames.bucky}`,
        weaponDefaultSkinImages.bucky
      )
    );
    defaultSkins.set(
      weaponNames.judge,
      new Skin(
        weaponDefaultSkinUUIDs.judge,
        `Standard ${weaponNames.judge}`,
        weaponDefaultSkinImages.judge
      )
    );
    // RIFLES
    defaultSkins.set(
      weaponNames.bulldog,
      new Skin(
        weaponDefaultSkinUUIDs.bulldog,
        `Standard ${weaponNames.bulldog}`,
        weaponDefaultSkinImages.bulldog
      )
    );
    defaultSkins.set(
      weaponNames.guardian,
      new Skin(
        weaponDefaultSkinUUIDs.guardian,
        `Standard ${weaponNames.guardian}`,
        weaponDefaultSkinImages.guardian
      )
    );
    defaultSkins.set(
      weaponNames.phantom,
      new Skin(
        weaponDefaultSkinUUIDs.phantom,
        `Standard ${weaponNames.phantom}`,
        weaponDefaultSkinImages.phantom
      )
    );
    defaultSkins.set(
      weaponNames.vandal,
      new Skin(
        weaponDefaultSkinUUIDs.vandal,
        `Standard ${weaponNames.vandal}`,
        weaponDefaultSkinImages.vandal
      )
    );
    // SNIPERS
    defaultSkins.set(
      weaponNames.marshal,
      new Skin(
        weaponDefaultSkinUUIDs.marshal,
        `Standard ${weaponNames.marshal}`,
        weaponDefaultSkinImages.marshal
      )
    );
    defaultSkins.set(
      weaponNames.operator,
      new Skin(
        weaponDefaultSkinUUIDs.operator,
        `Standard ${weaponNames.operator}`,
        weaponDefaultSkinImages.operator
      )
    );

    // HEAVY
    defaultSkins.set(
      "ares",
      new Skin(
        weaponDefaultSkinUUIDs.ares,
        `Standard ${weaponNames.ares}`,
        weaponDefaultSkinImages.ares
      )
    );
    defaultSkins.set(
      "odin",
      new Skin(
        weaponDefaultSkinUUIDs.operator,
        `Standard ${weaponNames.odin}`,
        weaponDefaultSkinImages.odin
      )
    );

    return defaultSkins;
  }
}
