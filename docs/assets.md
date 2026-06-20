# Asset Structure

```text
assets/
  characters/
    player.png
    emma.png
    noah.png
  crops/
    wheat.png
    carrot.png
    potato.png
    plants.png
    wheat_sheet.png
    youngwheat_sheet.png
  tiles/
    grass.png
    soil.png
    watered_soil.png
    farming_fishing.png
    plowed_soil.png
    tallgrass.png
    fence.png
    fence_alt.png
  buildings/
    barn.png
    house.png
    shop.png
    lpc_farm_sheet.png
    windmill_blade.png
    windmill_blade_small.png
    water_wheel.png
    water_wheel_ns.png
  animals/
    chicken_walk.png
    chicken_eat.png
    cow_walk.png
    cow_eat.png
    sheep_walk.png
    sheep_eat.png
    pig_walk.png
    pig_eat.png
    llama_walk.png
    llama_eat.png
  ui/
    inventory.png
    dialogue_box.png
    scrollsandblocks.png
  magic/
```

The LPC farm upload is preserved under `assets/buildings/`. The running game uses cropped regions from `lpc_farm_sheet.png` for buildable farm structures, with generated sprite fallbacks if the sheet is unavailable.

Credits for the LPC farm pack are stored in `assets/buildings/CREDITS-lpc-farm.txt`.

Daniel Eddeland's LPC farming/magic/UI pack is preserved through:

- `assets/CREDITS-daneeklu.txt`
- `assets/tiles/`
- `assets/crops/`
- `assets/ui/`
- `assets/magic/`
- `assets/characters/grab_sheet.png`
- `assets/characters/sword_sheet_128.png`

The renderer prefers the Daneeklu grass, plowed soil, wheat, young wheat, and plant sheets where possible.
