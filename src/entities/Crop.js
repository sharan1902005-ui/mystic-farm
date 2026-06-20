export class Crop {
  constructor(data = {}) {
    Object.assign(this, {
      id: "wheat",
      name: "Wheat",
      days: 3,
      season: ["Spring"],
      sell: 40
    }, data);
  }
}
