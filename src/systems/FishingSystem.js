export class FishingSystem {
  rollCatch(fishTable, random = Math.random) {
    return fishTable[Math.floor(random() * fishTable.length)];
  }
}
