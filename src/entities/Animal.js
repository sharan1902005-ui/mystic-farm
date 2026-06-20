export class Animal {
  constructor(data = {}) {
    Object.assign(this, {
      type: "chicken",
      happiness: 50,
      age: 0,
      fed: false,
      x: 0,
      y: 0,
      state: "idle",
      direction: "down"
    }, data);
  }
}
