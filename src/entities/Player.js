export class Player {
  constructor(data = {}) {
    Object.assign(this, {
      x: 0,
      y: 0,
      width: 34,
      height: 42,
      direction: "down",
      speed: 4,
      energy: 100,
      health: 100
    }, data);
  }
}
