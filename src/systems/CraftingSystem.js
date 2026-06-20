export class CraftingSystem {
  canCraft(recipe, inventory) {
    return Object.entries(recipe).every(([id, qty]) => (inventory[id] || 0) >= qty);
  }
}
