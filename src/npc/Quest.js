export class Quest {
  constructor({ npc, item, quantity, reward }) {
    this.npc = npc;
    this.item = item;
    this.quantity = quantity;
    this.reward = reward;
    this.completed = false;
  }
}
