export class Crop {
  constructor(id, daysRequired) {
    this.id = id;
    this.daysRequired = daysRequired;
    this.daysGrowing = 0;
    this.harvestable = false;
  }
}

export function growCrop(crop, watered) {
  if (!crop || !watered || crop.harvestable) {
    return crop;
  }

  crop.daysGrowing += 1;
  crop.harvestable = crop.daysGrowing >= crop.daysRequired;
  return crop;
}
