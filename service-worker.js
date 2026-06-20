const CACHE_NAME = "mystic-farm-v10";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./src/main.js",
  "./src/core/SaveManager.js",
  "./src/core/DebugConsole.js",
  "./src/core/Game.js",
  "./src/core/AudioManager.js",
  "./src/core/AssetManager.js",
  "./src/core/MapManager.js",
  "./src/entities/Player.js",
  "./src/entities/NPC.js",
  "./src/entities/Animal.js",
  "./src/entities/Crop.js",
  "./src/world/Crop.js",
  "./src/world/Tile.js",
  "./src/world/Weather.js",
  "./src/player/Player.js",
  "./src/player/Inventory.js",
  "./src/player/PlayerAnimator.js",
  "./src/npc/NPC.js",
  "./src/npc/Dialogue.js",
  "./src/npc/Quest.js",
  "./src/systems/FarmingSystem.js",
  "./src/systems/AnimalSystem.js",
  "./src/systems/AnimalAI.js",
  "./src/systems/FishingSystem.js",
  "./src/systems/CraftingSystem.js",
  "./src/systems/WeatherSystem.js",
  "./src/ui/HUD.js",
  "./src/ui/Menu.js",
  "./src/ui/Menus.js",
  "./src/ui/Inventory.js",
  "./assets/characters/player.png",
  "./assets/characters/emma.png",
  "./assets/characters/noah.png",
  "./assets/crops/wheat.png",
  "./assets/crops/carrot.png",
  "./assets/crops/potato.png",
  "./assets/tiles/grass.png",
  "./assets/tiles/soil.png",
  "./assets/tiles/watered_soil.png",
  "./assets/tiles/farming_fishing.png",
  "./assets/tiles/plowed_soil.png",
  "./assets/tiles/tallgrass.png",
  "./assets/tiles/fence.png",
  "./assets/tiles/fence_alt.png",
  "./assets/crops/plants.png",
  "./assets/crops/wheat_sheet.png",
  "./assets/crops/youngwheat_sheet.png",
  "./assets/buildings/house.png",
  "./assets/buildings/barn.png",
  "./assets/buildings/shop.png",
  "./assets/buildings/lpc_farm_sheet.png",
  "./assets/buildings/windmill_blade.png",
  "./assets/buildings/windmill_blade_small.png",
  "./assets/buildings/water_wheel.png",
  "./assets/buildings/water_wheel_ns.png",
  "./assets/buildings/CREDITS-lpc-farm.txt",
  "./assets/animals/chicken.png",
  "./assets/animals/cow.png",
  "./assets/animals/chicken_walk.png",
  "./assets/animals/chicken_eat.png",
  "./assets/animals/chicken_shadow.png",
  "./assets/animals/cow_walk.png",
  "./assets/animals/cow_eat.png",
  "./assets/animals/cow_shadow.png",
  "./assets/animals/sheep_walk.png",
  "./assets/animals/sheep_eat.png",
  "./assets/animals/pig_walk.png",
  "./assets/animals/pig_eat.png",
  "./assets/animals/llama_walk.png",
  "./assets/animals/llama_eat.png",
  "./assets/animals/llama_shadow.png",
  "./assets/ui/inventory.png",
  "./assets/ui/dialogue_box.png",
  "./assets/ui/scrollsandblocks.png",
  "./assets/characters/grab_sheet.png",
  "./assets/characters/sword_sheet_128.png",
  "./assets/magic/magic_firelion_big.png",
  "./assets/magic/magic_firelion_sheet.png",
  "./assets/magic/magic_iceshield_sheet.png",
  "./assets/magic/magic_snakebite_sheet.png",
  "./assets/magic/magic_torrentacle.png",
  "./assets/magic/turtleshell_front.png",
  "./assets/magic/turtleshell_side.png",
  "./assets/CREDITS-daneeklu.txt"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => (
      cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
    ))
  );
});
