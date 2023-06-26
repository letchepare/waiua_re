import { UUID } from "crypto";

export class Skin {
  skinId: UUID;
  name: string;
  image: string;

  constructor(skinID: UUID, name: string, image: string) {
    this.skinId = skinID;
    this.name = name;
    this.image = image;
  }
}
