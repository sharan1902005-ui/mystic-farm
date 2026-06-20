export class FarmingSystem {
  canPlant(tile) {
    return tile.type === "soil" && tile.watered && !tile.crop;
  }
}
