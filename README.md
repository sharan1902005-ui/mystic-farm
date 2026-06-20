# Mystic Farm Canvas

A portfolio-focused farming RPG prototype built with HTML5 Canvas and JavaScript.

## Features

- ES module source layout under `src/`
- Canvas renderer, game loop, camera follow, collision, and keyboard/mobile input
- Procedural farm decoration and generated mine levels
- Farming, seasons, weather, dynamic crop market, shipping, animals, cooking, and save slots
- Fishing collections, museum donations, mining, enemies, boss encounters, equipment, and talents
- NPC friendship hooks, reputation, festivals, pet finds, analytics dashboard, and building placement mode
- Optional same-browser-tab co-op showcase using `BroadcastChannel`
- PWA manifest and service worker for installable/offline play
- Modding hook for `mods/crops.json`
- 16x16 generated sprite-sheet renderer scaled for a retro pixel look
- Crop sway animation, pooled particles, screen shake, animated notifications, achievements, and settings
- Accessibility polish: color-blind display mode, large UI toggle, and interact-key rebinding
- Automated save backups for every save slot
- F1 developer panel with FPS, player position, gold, energy, weather, and season
- Unit-tested game logic with Node's built-in test runner

## Architecture

```text
Engine
  Renderer, Sprite Sheet, Input, SaveManager, Audio, PWA, Co-op Sync
World
  Procedural Farm, Mine Levels, Weather, Seasons, Festivals
Player
  Energy, Health, Inventory, Tools, Equipment, Skills, Talents
Gameplay
  Farming, Fishing, Mining, Combat, Animals, Cooking, Crafting
Economy
  Shop, Shipping, Dynamic Market, Item Values
Portfolio
  Analytics Dashboard, Achievements, Settings, Modding Hook, Mobile Controls
```

## Documentation

- [Architecture](docs/architecture.md)
- [Game Systems](docs/systems.md)
- [Save Format](docs/save-format.md)
- [UML Sketch](docs/uml.md)
- [Portfolio Case Study](docs/case-study.md)
- [Assets](docs/assets.md)

## Assets

```text
assets/
  characters/
  crops/
  tiles/
  buildings/
  animals/
  ui/
```

Animal walk/eat sprite sheets are loaded from `assets/animals/` and rendered in the farm scene with generated fallback sprites.
The uploaded LPC farm tileset is loaded from `assets/buildings/lpc_farm_sheet.png` for buildable farm structures.
The Daneeklu LPC farming pack is loaded for grass, plowed soil, wheat, young wheat, and plant crop art.

## Metrics

- 100% vanilla JavaScript
- HTML5 Canvas renderer
- 25+ game systems represented
- 40+ item, crop, resource, fish, equipment, and buildable concepts
- ES module architecture with automated logic tests
- PWA-ready with offline service worker

## Development

```bash
npm test
npm run check
```

## Controls

- `WASD` or arrow keys: move
- `E`: interact with the faced tile
- `F1`: developer panel
- `1-7`: select tools
- Tool buttons: mouse/touch selection
- Mobile pad: touch movement and interact

## Roadmap

- Split `index.html` into modules under `js/`
- Add real sprite sheets and audio assets
- Add WebSocket/PeerJS multiplayer beyond the local tab co-op showcase
- Add screenshots and a gameplay GIF after deployment
