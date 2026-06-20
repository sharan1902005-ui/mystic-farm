export class NPC {
  constructor(data = {}) {
    Object.assign(this, {
      id: "",
      name: "",
      role: "",
      x: 0,
      y: 0,
      friendship: 0,
      schedule: {}
    }, data);
  }
}
