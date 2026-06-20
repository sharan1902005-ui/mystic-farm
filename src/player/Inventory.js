export class Inventory {
  constructor() {
    this.items = new Map();
  }

  add(id, quantity = 1) {
    this.items.set(id, (this.items.get(id) || 0) + quantity);
  }

  remove(id, quantity = 1) {
    const next = Math.max(0, (this.items.get(id) || 0) - quantity);
    this.items.set(id, next);
    return next;
  }
}
