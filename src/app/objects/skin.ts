import { UUID } from "crypto";

export class Skin {
  skinId: string;
  name: string;
  image: string;

  constructor(skinID: string, name: string, image: string) {
    this.skinId = skinID;
    this.name = name;
    this.image = image;
  }
}
