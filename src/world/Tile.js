export class Tile {
  constructor(type = "grass") {
    this.type = type;
    this.solid = false;
    this.crop = null;
    this.watered = false;
    this.resource = null;
  }
}
