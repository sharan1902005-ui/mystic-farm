import test from "node:test";
import assert from "node:assert/strict";
import { Crop, growCrop } from "../src/world/Crop.js";
import { rollWeather } from "../src/world/Weather.js";
import { Inventory } from "../src/player/Inventory.js";

test("crop grows after watering", () => {
  const crop = new Crop("wheat", 3);

  growCrop(crop, true);
  growCrop(crop, true);
  growCrop(crop, true);

  assert.equal(crop.harvestable, true);
  assert.equal(crop.daysGrowing, 3);
});

test("crop does not grow when dry", () => {
  const crop = new Crop("wheat", 3);

  growCrop(crop, false);

  assert.equal(crop.harvestable, false);
  assert.equal(crop.daysGrowing, 0);
});

test("weather roll maps probability bands", () => {
  assert.equal(rollWeather(() => 0.2), "Sunny");
  assert.equal(rollWeather(() => 0.8), "Rainy");
  assert.equal(rollWeather(() => 0.95), "Windy");
});

test("inventory stacks and removes quantities", () => {
  const inventory = new Inventory();

  inventory.add("wood", 5);
  inventory.add("wood", 3);
  inventory.remove("wood", 2);

  assert.equal(inventory.items.get("wood"), 6);
});
