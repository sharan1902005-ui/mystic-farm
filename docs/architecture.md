# Architecture

Mystic Farm is now organized around ES modules under `src/`.

```text
src/
  core/
    Game.js
    SaveManager.js
    AudioManager.js
    DebugConsole.js
  world/
    Tile.js
    Crop.js
    Weather.js
  player/
    Player.js
    Inventory.js
  npc/
    NPC.js
    Dialogue.js
    Quest.js
  systems/
    FarmingSystem.js
    FishingSystem.js
    CraftingSystem.js
  ui/
    HUD.js
    Menu.js
```

The current playable build still runs through `src/main.js`, but high-risk systems now have dedicated module boundaries and testable logic.

## Runtime Flow

```text
Input -> Update -> Systems -> Render -> Save/Notify
```

The canvas renderer uses visible-tile culling and a generated 16x16 sprite sheet scaled to 48x48.
