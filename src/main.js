
import { SaveManager } from "./core/SaveManager.js";
import { DebugConsole } from "./core/DebugConsole.js";
import { AudioManager } from "./core/AudioManager.js";
import { MapManager } from "./core/MapManager.js";
import { PlayerAnimator } from "./player/PlayerAnimator.js";
import { AnimalAI } from "./systems/AnimalAI.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 1280;
canvas.height = 720;

const TILE = 48;
const SPRITE = 16;
const MAP_W = 48;
const MAP_H = 32;
const SAVE_PREFIX = "mysticFarmSlot";
const GAME_VERSION = "v1.0";
const AUTO_SAVE_INTERVAL_MS = 60000;
const saveManager = new SaveManager(SAVE_PREFIX);
const audioManager = new AudioManager();
const seasons = ["Spring", "Summer", "Fall", "Winter"];
const weatherTypes = ["Sunny", "Rainy", "Windy"];
const solidTileTypes = new Set([
    "tree",
    "rock",
    "ore",
    "house",
    "shop",
    "museum",
    "mine",
    "coop",
    "barn",
    "shed",
    "well",
    "blacksmith",
    "bed",
    "table",
    "chest",
    "counter",
    "seedRack",
    "toolRack",
    "shippingDesk",
    "anvil",
    "forge",
    "repairBench",
    "stove",
    "animalStall",
    "feedTrough",
    "fence",
    "water",
    "wall"
]);

const tools = ["hoe", "water", "seed", "hand", "axe", "pickaxe", "rod"];
const toolLabels = {
    hoe: "Hoe",
    water: "Water",
    seed: "Seed",
    hand: "Hand",
    axe: "Axe",
    pickaxe: "Pickaxe",
    rod: "Rod"
};

const crops = {
    wheat: { name: "Wheat", seed: "wheatSeed", buy: 20, sell: 40, days: 3, season: ["Spring", "Fall"], color: "#d7b34a" },
    carrot: { name: "Carrot", seed: "carrotSeed", buy: 30, sell: 60, days: 4, season: ["Spring"], color: "#ef7d32" },
    potato: { name: "Potato", seed: "potatoSeed", buy: 40, sell: 80, days: 5, season: ["Spring"], color: "#caa46a" },
    tomato: { name: "Tomato", seed: "tomatoSeed", buy: 60, sell: 120, days: 6, season: ["Summer"], color: "#dc4b3f" },
    pumpkin: { name: "Pumpkin", seed: "pumpkinSeed", buy: 100, sell: 220, days: 8, season: ["Fall"], color: "#f39a35" }
};

const itemValues = {
    wood: 5,
    stone: 5,
    copperOre: 15,
    ironOre: 30,
    goldOre: 60,
    egg: 50,
    milk: 100,
    wool: 85,
    llamaWool: 120,
    truffle: 180,
    omelette: 160,
    pumpkinPie: 320
};

const recipes = {
    omelette: { egg: 1, milk: 1 },
    pumpkinPie: { pumpkin: 2 },
    coop: { wood: 200, stone: 100, gold: 1000 },
    barn: { wood: 260, stone: 140, gold: 1800 },
    shed: { wood: 120, stone: 80, gold: 700 },
    well: { wood: 40, stone: 120, gold: 400 },
    furnace: { wood: 30, stone: 40 }
};

const enemyTypes = {
    slime: { name: "Slime", health: 35, damage: 4, color: "#62b65f", loot: "copperOre" },
    bat: { name: "Bat", health: 25, damage: 6, color: "#5c5470", loot: "ironOre" },
    skeleton: { name: "Skeleton", health: 55, damage: 8, color: "#d8d2bd", loot: "boneShard" },
    shadow: { name: "Shadow", health: 75, damage: 12, color: "#2a2038", loot: "ruby" },
    golem: { name: "Rock Golem", health: 180, damage: 18, color: "#8a8174", loot: "diamond", boss: true },
    worm: { name: "Crystal Worm", health: 220, damage: 22, color: "#69c7d3", loot: "crystalCore", boss: true }
};

const equipment = {
    rustySword: { name: "Rusty Sword", type: "weapon", attack: 4 },
    ironSword: { name: "Iron Sword", type: "weapon", attack: 10 },
    minerBoots: { name: "Miner Boots", type: "boots", defense: 3 },
    harvestRing: { name: "Harvest Ring", type: "ring", cropValue: 0.1 }
};

const talentCatalog = {
    farmingValue: { tree: "Farming", name: "+10% Crop Value", cost: 1 },
    farmingSpeed: { tree: "Farming", name: "+20% Growth Speed", cost: 1 },
    doubleHarvest: { tree: "Farming", name: "Double Harvest Chance", cost: 2 },
    rareFish: { tree: "Fishing", name: "Rare Fish Chance", cost: 1 },
    catchWindow: { tree: "Fishing", name: "Bigger Catch Window", cost: 1 },
    extraOre: { tree: "Mining", name: "Extra Ore", cost: 1 },
    efficientMining: { tree: "Mining", name: "Less Mining Energy", cost: 1 }
};

const festivals = [
    { season: "Spring", day: 14, name: "Flower Festival", reward: "reputation" },
    { season: "Summer", day: 14, name: "Fishing Derby", reward: "gold" },
    { season: "Fall", day: 14, name: "Harvest Festival", reward: "cropValue" },
    { season: "Winter", day: 14, name: "Ice Market", reward: "rareItem" }
];

const buildables = {
    coop: { name: "Coop", type: "coop", cost: recipes.coop, color: "#b17a45" },
    barn: { name: "Barn", type: "barn", cost: recipes.barn, color: "#9f4f3c" },
    shed: { name: "Shed", type: "shed", cost: recipes.shed, color: "#7f6f55" },
    well: { name: "Well", type: "well", cost: recipes.well, color: "#4d7ca1" },
    path: { name: "Path", type: "path", cost: { stone: 1 }, color: "#927954" },
    fence: { name: "Fence", type: "fence", cost: { wood: 1 }, color: "#8a5a35" }
};

const defaultSettings = {
    musicVolume: 45,
    sfxVolume: 70,
    fullscreen: false,
    colorBlind: false,
    uiScale: "normal",
    interactKey: "e"
};

const achievements = {
    firstHarvest: { name: "First Harvest", test: () => game.stats.cropsHarvested >= 1 },
    masterFarmer: { name: "Master Farmer", test: () => game.stats.cropsHarvested >= 100 },
    millionaire: { name: "Millionaire", test: () => game.gold >= 1000000 },
    fishingExpert: { name: "Fishing Expert", test: () => game.stats.fishCaught >= 50 },
    treeDestroyer: { name: "Tree Destroyer", test: () => game.stats.treesChopped >= 50 },
    caveChampion: { name: "Cave Champion", test: () => game.stats.bossesDefeated >= 1 },
    museumPatron: { name: "Museum Patron", test: () => game.collections.museum.length >= 10 }
};

const sprites = createSprites();
const playerAnimator = new PlayerAnimator();
const animalAI = new AnimalAI();
let mapManager;
const keys = {};
const particles = [];
const particlePool = [];
const floatingTexts = [];
const maxParticles = 260;
const systems = {};
let messageTimer = 0;
let message = "WASD move. E interacts with the tile you face.";
let lastTime = performance.now();
let fps = 0;
let coopChannel = null;
let coopTimer = 0;
let settings = loadSettings();
let externalAssetsLoaded = 0;
let playerFrame = 0;
let animationClock = 0;
let ambientLifeTimer = 0;
let autoSaveTimer = 0;

const uiState = {
    screen: "title",
    paused: false,
    fade: 1,
    screenshotMode: false,
    cinematicMode: false,
    minimapVisible: true
};

const EXTERNAL_ASSET_TOTAL = 43;
const animalAssets = loadAnimalAssets();
const buildingAssets = loadBuildingAssets();
const daneekluAssets = loadDaneekluAssets();
const characterAssets = loadCharacterAssets();

const camera = { x: 0, y: 0, shake: 0 };

const player = {
    x: 7 * TILE,
    y: 7 * TILE,
    width: 34,
    height: 42,
    direction: "down",
    speed: 4,
    moving: false,
    energy: 100,
    health: 100,
    maxHealth: 100,
    attack: 8,
    defense: 2,
    tool: "hoe",
    actionTimer: 0,
    actionTool: null,
    fishing: null,
    equipment: {
        weapon: "rustySword",
        armor: null,
        ring: null,
        boots: null
    }
};

const game = {
    day: 1,
    season: "Spring",
    year: 1,
    weather: "Sunny",
    gold: 500,
    currentMap: "farm",
    selectedCrop: "wheat",
    mineDepth: 1,
    reputation: 0,
    skillPoints: 0,
    time: 600,
    placementMode: null,
    market: {},
    activeFestival: null,
    multiplayer: {
        enabled: false,
        id: Math.random().toString(36).slice(2),
        role: "solo",
        peers: {}
    },
    pet: {
        type: "Dog",
        happiness: 50,
        foundToday: false
    },
    inventory: {
        wheatSeed: 10,
        carrotSeed: 4,
        potatoSeed: 4,
        wood: 20,
        stone: 10,
        rustySword: 1
    },
    stats: {
        moneyEarned: 0,
        cropsHarvested: 0,
        fishCaught: 0,
        treesChopped: 0,
        rocksBroken: 0,
        enemiesDefeated: 0,
        bossesDefeated: 0,
        hoursPlayed: 0
    },
    talents: {},
    achievements: {},
    skills: {
        farming: { level: 1, xp: 0 },
        mining: { level: 1, xp: 0 },
        fishing: { level: 1, xp: 0 },
        cooking: { level: 1, xp: 0 }
    },
    toolTier: {
        hoe: "Basic",
        axe: "Basic",
        pickaxe: "Basic",
        rod: "Basic"
    },
    animals: [
        { type: "chicken", happiness: 60, age: 1, fed: true, x: 10, y: 17, px: 10, py: 17, state: "walk", direction: "down" },
        { type: "cow", happiness: 55, age: 1, fed: true, x: 11, y: 17, px: 11, py: 17, state: "eat", direction: "right" },
        { type: "sheep", happiness: 58, age: 1, fed: true, x: 12, y: 18, px: 12, py: 18, state: "walk", direction: "left" },
        { type: "pig", happiness: 52, age: 1, fed: true, x: 13, y: 18, px: 13, py: 18, state: "eat", direction: "right" },
        { type: "llama", happiness: 64, age: 1, fed: true, x: 14, y: 17, px: 14, py: 17, state: "walk", direction: "left" }
    ],
    collections: {
        fish: [],
        museum: []
    },
    tutorial: {
        moved: false,
        interacted: false,
        planted: false,
        harvested: false,
        dismissed: false
    },
    maps: {}
};

const debugConsole = new DebugConsole(() => ({ fps, player, game }));

mapManager = new MapManager({
    game,
    player,
    tileSize: TILE,
    ensureWalkable: ensurePlayerOnWalkableTile,
    centerCamera: centerCameraOnPlayer,
    onTransition: () => {
        uiState.fade = 1;
        Object.keys(keys).forEach((key) => { keys[key] = false; });
        say(`Entered ${getMap().name}.`);
    }
});

window.addEventListener("error", (event) => {
    console.warn("Recovered from runtime error", event.error || event.message);
    notify("Recovered from a runtime hiccup.");
});

window.addEventListener("unhandledrejection", (event) => {
    console.warn("Recovered from async error", event.reason);
    notify("Recovered from an async hiccup.");
});

function createSprites() {
    const definitions = {
        grass: ["#4d9a46", "#3f7f39"],
        soil: ["#8a5a35", "#70472c"],
        watered: ["#557dad", "#42668f"],
        water: ["#326e9e", "#275a82"],
        tree: ["#315a31", "#1f3f24"],
        rock: ["#777b82", "#5d6269"],
        ore: ["#756653", "#554838"],
        house: ["#9a6144", "#744633"],
        shop: ["#b48938", "#816127"],
        mine: ["#4b4d55", "#34373e"],
        museum: ["#6f6a8f", "#4c4969"],
        coop: ["#b17a45", "#7d5431"],
        barn: ["#9f4f3c", "#6f3429"],
        shed: ["#7f6f55", "#5d503d"],
        well: ["#4d7ca1", "#365a75"],
        blacksmith: ["#675c58", "#453f3c"],
        townSquare: ["#9b8158", "#70583a"],
        path: ["#927954", "#6c5639"],
        dock: ["#8a6338", "#644526"],
        marker: ["#f0d568", "#b78b31"],
        fence: ["#8a5a35", "#604026"],
        floor: ["#5d6a54", "#4c5745"],
        wall: ["#384036", "#293026"],
        bed: ["#8b5648", "#5e3840"],
        table: ["#7a5535", "#5a3b24"],
        chest: ["#a66a32", "#754821"],
        counter: ["#9b6a3c", "#654126"],
        seedRack: ["#5f8a44", "#375b2c"],
        toolRack: ["#56606a", "#353c43"],
        shippingDesk: ["#8a6338", "#5f4024"],
        anvil: ["#62676f", "#343940"],
        forge: ["#6a3932", "#2c2523"],
        repairBench: ["#7a5535", "#4b3020"],
        stove: ["#5c6068", "#31353b"],
        animalStall: ["#9b6a3c", "#654126"],
        feedTrough: ["#8b7544", "#5f4a27"],
        stoneFloor: ["#4a4e55", "#3b3f45"],
        flower: ["#5b9d55", "#d779a7"],
        stairs: ["#5d5149", "#2d2824"],
        player: ["#273f8f", "#f0bd8b"],
        npc: ["#c97c4a", "#8d5133"]
    };
    const names = Object.keys(definitions);
    const columns = 8;
    const sheet = document.createElement("canvas");
    const frames = {};
    sheet.width = columns * SPRITE;
    sheet.height = Math.ceil(names.length / columns) * SPRITE;
    const s = sheet.getContext("2d");

    names.forEach((name, index) => {
        const sx = (index % columns) * SPRITE;
        const sy = Math.floor(index / columns) * SPRITE;
        drawSpriteCell(s, sx, sy, name, definitions[name][0], definitions[name][1]);
        frames[name] = { sx, sy, sw: SPRITE, sh: SPRITE };
    });

    return { sheet, frames, loaded: names.length, total: names.length };
}

function drawSpriteCell(s, x, y, name, fill, shade) {
    s.fillStyle = fill;
    s.fillRect(x, y, SPRITE, SPRITE);
    s.fillStyle = shade;
    s.fillRect(x + 2, y + 2, SPRITE - 4, SPRITE - 4);
    s.fillStyle = "rgba(255,255,255,0.08)";
    s.fillRect(x + 3, y + 3, 5, 3);

    if (name === "tree") {
        s.fillStyle = "#5b3a24";
        s.fillRect(x + 7, y + 9, 3, 6);
        s.fillStyle = "#2f7a3e";
        s.fillRect(x + 3, y + 2, 10, 9);
    }

    if (name === "bed") {
        s.fillStyle = "#f1e2c8";
        s.fillRect(x + 3, y + 3, 10, 3);
        s.fillStyle = "#8b5648";
        s.fillRect(x + 3, y + 6, 10, 7);
    }

    if (name === "table") {
        s.fillStyle = "#4b2f1d";
        s.fillRect(x + 4, y + 4, 8, 7);
        s.fillRect(x + 5, y + 11, 2, 4);
        s.fillRect(x + 10, y + 11, 2, 4);
    }

    if (name === "chest") {
        s.fillStyle = "#cf8a37";
        s.fillRect(x + 3, y + 5, 10, 7);
        s.fillStyle = "#f0d568";
        s.fillRect(x + 7, y + 7, 2, 3);
    }

    if (name === "dock") {
        s.fillStyle = "#8a6338";
        s.fillRect(x, y + 4, SPRITE, 8);
        s.fillStyle = "#5f3f23";
        s.fillRect(x + 3, y + 1, 2, 14);
        s.fillRect(x + 11, y + 1, 2, 14);
    }

    if (name === "marker") {
        s.fillStyle = "#f0d568";
        s.fillRect(x + 7, y + 3, 2, 10);
        s.fillStyle = "#c85b4d";
        s.fillRect(x + 8, y + 3, 5, 4);
    }

    if (name === "blacksmith") {
        s.fillStyle = "#2d2927";
        s.fillRect(x + 4, y + 4, 8, 8);
        s.fillStyle = "#e36b36";
        s.fillRect(x + 6, y + 7, 4, 4);
    }

    if (name === "counter" || name === "shippingDesk" || name === "repairBench") {
        s.fillStyle = "#4b2f1d";
        s.fillRect(x + 2, y + 5, 12, 6);
        s.fillStyle = "#c18a4d";
        s.fillRect(x + 3, y + 4, 10, 2);
    }

    if (name === "seedRack") {
        s.fillStyle = "#3f7f39";
        s.fillRect(x + 4, y + 3, 8, 10);
        s.fillStyle = "#f0d568";
        s.fillRect(x + 5, y + 5, 2, 2);
        s.fillRect(x + 9, y + 8, 2, 2);
    }

    if (name === "toolRack") {
        s.fillStyle = "#3b3f45";
        s.fillRect(x + 4, y + 3, 8, 10);
        s.fillStyle = "#d8d2bd";
        s.fillRect(x + 6, y + 4, 2, 8);
        s.fillRect(x + 10, y + 4, 2, 8);
    }

    if (name === "anvil") {
        s.fillStyle = "#2e3338";
        s.fillRect(x + 4, y + 7, 9, 3);
        s.fillRect(x + 6, y + 10, 5, 3);
    }

    if (name === "forge" || name === "stove") {
        s.fillStyle = "#25282d";
        s.fillRect(x + 4, y + 4, 8, 9);
        s.fillStyle = name === "forge" ? "#e36b36" : "#9fc3d9";
        s.fillRect(x + 6, y + 7, 4, 3);
    }

    if (name === "animalStall") {
        s.fillStyle = "#5f3f23";
        s.fillRect(x + 2, y + 4, 12, 8);
        s.fillStyle = "#d8b06a";
        s.fillRect(x + 4, y + 6, 8, 4);
    }

    if (name === "feedTrough") {
        s.fillStyle = "#5f4a27";
        s.fillRect(x + 3, y + 8, 10, 4);
        s.fillStyle = "#9fd67f";
        s.fillRect(x + 4, y + 6, 8, 2);
    }

    if (name === "player") {
        s.fillStyle = "#273f8f";
        s.fillRect(x + 4, y + 6, 8, 8);
        s.fillStyle = "#f0bd8b";
        s.fillRect(x + 5, y + 2, 6, 5);
        s.fillStyle = "#3a2a21";
        s.fillRect(x + 4, y + 1, 8, 2);
    }
}

function drawSprite(name, x, y, w = TILE, h = TILE) {
    const frame = sprites.frames[name] || sprites.frames.grass;
    ctx.drawImage(sprites.sheet, frame.sx, frame.sy, frame.sw, frame.sh, x, y, w, h);
}

const lpcBuildingFrames = {
    barn: { sx: 642, sy: 1124, sw: 188, sh: 150 },
    coop: { sx: 196, sy: 1132, sw: 88, sh: 72 },
    shed: { sx: 384, sy: 824, sw: 128, sh: 128 },
    well: { sx: 132, sy: 930, sw: 64, sh: 76 },
    fence: { sx: 0, sy: 1088, sw: 96, sh: 96 }
};

function loadAnimalAssets() {
    const definitions = {
        chicken: {
            walk: "assets/animals/chicken_walk.png",
            eat: "assets/animals/chicken_eat.png",
            shadow: "assets/animals/chicken_shadow.png"
        },
        cow: {
            walk: "assets/animals/cow_walk.png",
            eat: "assets/animals/cow_eat.png",
            shadow: "assets/animals/cow_shadow.png"
        },
        sheep: {
            walk: "assets/animals/sheep_walk.png",
            eat: "assets/animals/sheep_eat.png"
        },
        pig: {
            walk: "assets/animals/pig_walk.png",
            eat: "assets/animals/pig_eat.png"
        },
        llama: {
            walk: "assets/animals/llama_walk.png",
            eat: "assets/animals/llama_eat.png",
            shadow: "assets/animals/llama_shadow.png"
        }
    };

    const loaded = {};

    Object.entries(definitions).forEach(([animal, states]) => {
        loaded[animal] = {};

        Object.entries(states).forEach(([state, path]) => {
            loaded[animal][state] = loadExternalImage(path);
        });
    });

    return loaded;
}

function loadBuildingAssets() {
    const definitions = {
        farmSheet: "assets/buildings/lpc_farm_sheet.png",
        windmillBlade: "assets/buildings/windmill_blade.png",
        windmillBladeSmall: "assets/buildings/windmill_blade_small.png",
        waterWheel: "assets/buildings/water_wheel.png",
        waterWheelNs: "assets/buildings/water_wheel_ns.png",
        barnIcon: "assets/buildings/barn.png",
        houseIcon: "assets/buildings/house.png",
        shopIcon: "assets/buildings/shop.png"
    };
    const loaded = {};

    Object.entries(definitions).forEach(([key, path]) => {
        loaded[key] = loadExternalImage(path);
    });

    return loaded;
}

function loadCharacterAssets() {
    return {
        player: loadExternalImage("assets/characters/player.png"),
        emma: loadExternalImage("assets/characters/emma.png"),
        noah: loadExternalImage("assets/characters/noah.png")
    };
}

function loadDaneekluAssets() {
    const definitions = {
        farmingFishing: "assets/tiles/farming_fishing.png",
        plowedSoil: "assets/tiles/plowed_soil.png",
        tallgrass: "assets/tiles/tallgrass.png",
        fence: "assets/tiles/fence.png",
        fenceAlt: "assets/tiles/fence_alt.png",
        plants: "assets/crops/plants.png",
        wheat: "assets/crops/wheat_sheet.png",
        youngwheat: "assets/crops/youngwheat_sheet.png",
        uiScrolls: "assets/ui/scrollsandblocks.png",
        grab: "assets/characters/grab_sheet.png",
        sword: "assets/characters/sword_sheet_128.png",
        firelionBig: "assets/magic/magic_firelion_big.png",
        firelion: "assets/magic/magic_firelion_sheet.png",
        iceshield: "assets/magic/magic_iceshield_sheet.png",
        snakebite: "assets/magic/magic_snakebite_sheet.png",
        torrentacle: "assets/magic/magic_torrentacle.png",
        turtleshellFront: "assets/magic/turtleshell_front.png",
        turtleshellSide: "assets/magic/turtleshell_side.png"
    };
    const loaded = {};

    Object.entries(definitions).forEach(([key, path]) => {
        loaded[key] = loadExternalImage(path);
    });

    return loaded;
}

function loadExternalImage(path) {
    const image = new Image();
    image.onload = () => {
        externalAssetsLoaded++;
        updateLoadingProgress();
    };
    image.onerror = () => updateLoadingProgress();
    image.src = path;
    return image;
}

function imageReady(image) {
    return image && image.complete && image.naturalWidth > 0;
}

function buildMap(id, name, width, height, fill = "grass") {
    const map = {
        id,
        name,
        width,
        height,
        tiles: [],
        npcs: [],
        enemies: [],
        exits: []
    };

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            row.push({ type: fill, solid: false, crop: null, watered: false, resource: null, hp: 0 });
        }
        map.tiles.push(row);
    }
    return map;
}

function initializeMaps() {
    game.maps.farm = buildMap("farm", "Farm", MAP_W, MAP_H);
    game.maps.house = buildMap("house", "Farmhouse", 16, 12, "floor");
    game.maps.shop = buildMap("shop", "General Store", 16, 12, "floor");
    game.maps.blacksmith = buildMap("blacksmith", "Blacksmith", 16, 12, "floor");
    game.maps.barn = buildMap("barn", "Barn Interior", 18, 12, "floor");
    game.maps.mine = buildMap("mine", "Mine 1", 34, 24, "stoneFloor");
    game.maps.museum = buildMap("museum", "Museum", 18, 12, "floor");

    generateProceduralFarm(game.maps.farm);
    borderMap(game.maps.farm, "tree");
    borderMap(game.maps.house, "wall");
    borderMap(game.maps.shop, "wall");
    borderMap(game.maps.blacksmith, "wall");
    borderMap(game.maps.barn, "wall");
    borderMap(game.maps.mine, "wall");
    borderMap(game.maps.museum, "wall");

    placeRect(game.maps.farm, 5, 4, 4, 3, "house", true);
    createFarmLayout(game.maps.farm);
    placeRect(game.maps.farm, 14, 5, 2, 2, "shop", true);
    placeRect(game.maps.farm, 20, 5, 2, 2, "museum", true);
    placeRect(game.maps.farm, 26, 5, 2, 2, "mine", true);
    placeRect(game.maps.farm, 9, 15, 3, 2, "barn", true);
    placeRect(game.maps.farm, 13, 16, 2, 2, "coop", true);
    createFencedAnimalArea(game.maps.farm);
    configureHouseInterior(game.maps.house);
    configureStoreInterior(game.maps.shop);
    configureBlacksmithInterior(game.maps.blacksmith);
    configureBarnInterior(game.maps.barn);
    createVillageArea(game.maps.farm);

    scatterResources(game.maps.farm, 90);
    createFarmLayout(game.maps.farm);
    placeRect(game.maps.farm, 14, 5, 2, 2, "shop", true);
    placeRect(game.maps.farm, 20, 5, 2, 2, "museum", true);
    placeRect(game.maps.farm, 26, 5, 2, 2, "mine", true);
    createFencedAnimalArea(game.maps.farm);
    configureHouseInterior(game.maps.house);
    configureStoreInterior(game.maps.shop);
    configureBlacksmithInterior(game.maps.blacksmith);
    configureBarnInterior(game.maps.barn);
    createVillageArea(game.maps.farm);
    generateMineLevel(1);

    game.maps.farm.npcs = [
        createNpc("lily", "Lily", "Farmer", 11, 8, { Morning: [11, 8], Afternoon: [18, 10], Evening: [7, 8] }),
        createNpc("tom", "Tom", "Carpenter", 17, 7, { Morning: [31, 11], Afternoon: [18, 10], Evening: [7, 8] }),
        createNpc("ben", "Ben", "Fisherman", 8, 23, { Morning: [8, 23], Afternoon: [18, 10], Evening: [8, 23] }),
        createNpc("rose", "Rose", "Shopkeeper", 14, 7, { Morning: [14, 7], Afternoon: [14, 7], Evening: [18, 10] }),
        createNpc("sage", "Sage", "Wizard", 33, 19, { Morning: [33, 19], Afternoon: [31, 11], Evening: [33, 19] }),
        createNpc("emma", "Emma", "Villager", 30, 8, { Morning: [30, 8], Afternoon: [34, 14], Evening: [14, 7], Night: [30, 8] }),
        createNpc("noah", "Noah", "Blacksmith", 35, 8, { Morning: [35, 8], Afternoon: [34, 14], Evening: [36, 14], Night: [35, 8] }),
        createNpc("ava", "Ava", "Herbalist", 38, 10, { Morning: [38, 10], Afternoon: [34, 14], Evening: [14, 7], Night: [38, 10] }),
        createNpc("iris", "Iris", "Tailor", 40, 8, { Morning: [40, 8], Afternoon: [34, 14], Evening: [14, 7], Night: [40, 8] }),
        createNpc("liam", "Liam", "Hunter", 28, 12, { Morning: [28, 12], Afternoon: [34, 14], Evening: [14, 7], Night: [28, 12] })
    ];

    // Village houses
    placeRect(game.maps.farm, 30, 6, 2, 2, "house", true);
    placeRect(game.maps.farm, 34, 6, 2, 2, "house", true);
    placeRect(game.maps.farm, 38, 6, 2, 2, "house", true);
    placeRect(game.maps.farm, 40, 6, 2, 2, "house", true);
    placeRect(game.maps.farm, 28, 10, 2, 2, "house", true);

    game.maps.farm.exits = [
        { x: 7, y: 7, to: "house", spawn: [7, 9] },
        { x: 14, y: 7, to: "shop", spawn: [7, 9] },
        { x: 37, y: 14, to: "blacksmith", spawn: [7, 9] },
        { x: 10, y: 16, to: "barn", spawn: [8, 9] },
        { x: 20, y: 7, to: "museum", spawn: [8, 9] },
        { x: 26, y: 7, to: "mine", spawn: [3, 3] }
    ];
    game.maps.house.exits = [{ x: 7, y: 10, to: "farm", spawn: [7, 8] }];
    game.maps.shop.exits = [{ x: 7, y: 10, to: "farm", spawn: [14, 8] }];
    game.maps.blacksmith.exits = [{ x: 7, y: 10, to: "farm", spawn: [37, 15] }];
    game.maps.barn.exits = [{ x: 8, y: 10, to: "farm", spawn: [10, 17] }];
    game.maps.mine.exits = [{ x: 3, y: 3, to: "farm", spawn: [26, 8] }];
    game.maps.museum.exits = [{ x: 8, y: 10, to: "farm", spawn: [20, 8] }];
}

function createFarmLayout(map) {
    clearRect(map, 2, 2, 24, 25, "grass");
    placeRect(map, 5, 4, 4, 3, "house", true);
    placeRect(map, 6, 7, 3, 1, "path", false);
    placeRect(map, 7, 8, 1, 18, "path", false);
    placeRect(map, 8, 12, 14, 1, "path", false);
    placeRect(map, 14, 7, 1, 14, "path", false);
    placeRect(map, 20, 7, 1, 8, "path", false);
    createCropField(map, 9, 9, 8, 6);
    createFishingPond(map, 3, 21);
    placeRect(map, 9, 15, 3, 2, "barn", true);
    placeRect(map, 13, 16, 2, 2, "coop", true);
    createFencedAnimalArea(map);
    createSmallForest(map);
    createVillageArea(map);
}

function configureHouseInterior(map) {
    clearRect(map, 1, 1, map.width - 2, map.height - 2, "floor");
    placeRect(map, 1, 1, map.width - 2, 1, "wall", true);
    placeRect(map, 1, map.height - 2, map.width - 2, 1, "wall", true);
    placeRect(map, 1, 1, 1, map.height - 2, "wall", true);
    placeRect(map, map.width - 2, 1, 1, map.height - 2, "wall", true);
    placeRect(map, 3, 3, 2, 2, "bed", true);
    placeRect(map, 5, 3, 1, 1, "stove", true);
    placeRect(map, 8, 4, 2, 1, "table", true);
    placeRect(map, 11, 7, 1, 1, "chest", true);
    placeRect(map, 7, 10, 2, 1, "floor", false);
}

function configureStoreInterior(map) {
    clearInterior(map);
    placeRect(map, 3, 3, 10, 1, "counter", true);
    placeRect(map, 3, 5, 2, 2, "seedRack", true);
    placeRect(map, 7, 5, 2, 2, "shippingDesk", true);
    placeRect(map, 11, 5, 2, 2, "toolRack", true);
    placeRect(map, 7, 10, 2, 1, "floor", false);
}

function configureBlacksmithInterior(map) {
    clearInterior(map);
    placeRect(map, 3, 4, 2, 2, "forge", true);
    placeRect(map, 7, 4, 2, 2, "anvil", true);
    placeRect(map, 11, 4, 2, 2, "repairBench", true);
    placeRect(map, 7, 10, 2, 1, "floor", false);
}

function configureBarnInterior(map) {
    clearInterior(map);
    placeRect(map, 3, 3, 3, 2, "animalStall", true);
    placeRect(map, 7, 3, 3, 2, "animalStall", true);
    placeRect(map, 11, 3, 3, 2, "animalStall", true);
    placeRect(map, 4, 7, 10, 1, "feedTrough", true);
    placeRect(map, 8, 10, 2, 1, "floor", false);
}

function clearInterior(map) {
    clearRect(map, 1, 1, map.width - 2, map.height - 2, "floor");
    placeRect(map, 1, 1, map.width - 2, 1, "wall", true);
    placeRect(map, 1, map.height - 2, map.width - 2, 1, "wall", true);
    placeRect(map, 1, 1, 1, map.height - 2, "wall", true);
    placeRect(map, map.width - 2, 1, 1, map.height - 2, "wall", true);
}

function createVillageArea(map) {
    placeRect(map, 24, 12, 19, 1, "path", false);
    placeRect(map, 34, 8, 1, 10, "path", false);
    placeRect(map, 31, 13, 7, 3, "path", false);
    placeRect(map, 36, 13, 2, 2, "blacksmith", true);
    placeRect(map, 33, 14, 3, 2, "townSquare", false);
    placeRect(map, 39, 14, 1, 1, "well", true);
}

function clearRect(map, x, y, w, h, type = "grass") {
    for (let yy = y; yy < y + h; yy++) {
        for (let xx = x; xx < x + w; xx++) {
            map.tiles[yy][xx] = { type, solid: solidTileTypes.has(type), crop: null, watered: false, resource: null, hp: 0 };
        }
    }
}

function createCropField(map, x, y, w, h) {
    for (let yy = y; yy < y + h; yy++) {
        for (let xx = x; xx < x + w; xx++) {
            map.tiles[yy][xx] = { type: "soil", solid: false, crop: null, watered: false, resource: null, hp: 0 };
        }
    }
}

function createSmallForest(map) {
    const spots = [
        [18, 18], [20, 18], [22, 19], [18, 21], [21, 22],
        [3, 12], [4, 13], [5, 12], [22, 10], [23, 11]
    ];
    spots.forEach(([x, y]) => {
        if (map.tiles[y]?.[x]) {
            map.tiles[y][x] = { type: "tree", solid: true, crop: null, watered: false, resource: "tree", hp: 3 };
        }
    });
}

function borderMap(map, type) {
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            if (x === 0 || y === 0 || x === map.width - 1 || y === map.height - 1) {
                map.tiles[y][x] = { type, solid: true, crop: null, watered: false, resource: type === "tree" ? "tree" : null, hp: 3 };
            }
        }
    }
}

function placeRect(map, x, y, w, h, type, solid) {
    for (let yy = y; yy < y + h; yy++) {
        for (let xx = x; xx < x + w; xx++) {
            map.tiles[yy][xx].type = type;
            map.tiles[yy][xx].solid = solid;
        }
    }
}

function createFishingPond(map, x, y) {
    for (let yy = y; yy < y + 5; yy++) {
        for (let xx = x; xx < x + 5; xx++) {
            map.tiles[yy][xx] = { type: "water", solid: true, crop: null, watered: false, resource: null, hp: 0 };
        }
    }
    for (let yy = y + 1; yy < y + 4; yy++) {
        map.tiles[yy][x + 5] = { type: "dock", solid: false, crop: null, watered: false, resource: null, hp: 0 };
    }
    map.tiles[y + 2][x + 4].marker = true;
}

function createFencedAnimalArea(map) {
    for (let y = 14; y <= 21; y++) {
        for (let x = 8; x <= 17; x++) {
            const isFence = x === 8 || x === 17 || y === 14 || y === 21;
            const isGate = y === 21 && (x === 12 || x === 13);
            if (isFence && !isGate) {
                map.tiles[y][x] = { type: "fence", solid: true, crop: null, watered: false, resource: null, hp: 2 };
            } else if (map.tiles[y][x].type === "grass" || map.tiles[y][x].type === "flower") {
                map.tiles[y][x] = { type: "grass", solid: false, crop: null, watered: false, resource: null, hp: 0 };
            }
        }
    }
    normalizeAnimalPen();
}

function normalizeAnimalPen() {
    const spots = [[10, 17], [11, 17], [12, 18], [13, 18], [14, 17]];
    game.animals.forEach((animal, index) => {
        normalizeAnimal(animal, index);
        if (animal.x < 9 || animal.x > 16 || animal.y < 17 || animal.y > 20) {
            const [x, y] = spots[index % spots.length];
            animal.x = x;
            animal.y = y;
            animal.px = x;
            animal.py = y;
        }
    });
}

function generateProceduralFarm(map) {
    for (let y = 1; y < map.height - 1; y++) {
        for (let x = 1; x < map.width - 1; x++) {
            const lakeNoise = Math.sin(x * 0.43) + Math.cos(y * 0.31) + Math.random() * 0.9;
            const flowerNoise = Math.sin((x + y) * 0.38) + Math.random();
            if (lakeNoise > 2.05 && x > 24 && y > 15) {
                map.tiles[y][x].type = "water";
                map.tiles[y][x].solid = true;
            } else if (flowerNoise > 1.55 && Math.random() < 0.08) {
                map.tiles[y][x].type = "flower";
            }
        }
    }
}

function scatterResources(map, count) {
    for (let i = 0; i < count; i++) {
        const x = rand(2, map.width - 3);
        const y = rand(2, map.height - 3);
        const tile = map.tiles[y][x];
        if (tile.solid || tile.type !== "grass") continue;
        const tree = Math.random() < 0.58;
        tile.resource = tree ? "tree" : "rock";
        tile.type = tree ? "tree" : "rock";
        tile.solid = true;
        tile.hp = tree ? 3 : 2;
    }
}

function generateMineLevel(depth) {
    const map = game.maps.mine || buildMap("mine", `Mine ${depth}`, 34, 24, "stoneFloor");
    game.maps.mine = map;
    map.name = `Mine ${depth}`;
    map.enemies = [];

    for (let y = 1; y < map.height - 1; y++) {
        for (let x = 1; x < map.width - 1; x++) {
            map.tiles[y][x] = { type: "stoneFloor", solid: false, crop: null, watered: false, resource: null, hp: 0 };
        }
    }

    borderMap(map, "wall");
    scatterMine(map, depth);
    map.tiles[map.height - 3][map.width - 4].type = "stairs";
    map.tiles[map.height - 3][map.width - 4].solid = false;
}

function scatterMine(map, depth = 1) {
    for (let i = 0; i < 70 + depth * 4; i++) {
        const x = rand(2, map.width - 3);
        const y = rand(2, map.height - 3);
        const tile = map.tiles[y][x];
        if (tile.solid) continue;
        const roll = Math.random();
        tile.type = roll < 0.7 ? "rock" : "ore";
        tile.resource = tile.type;
        tile.ore = roll > 0.94 ? "goldOre" : roll > 0.82 ? "ironOre" : "copperOre";
        tile.solid = true;
        tile.hp = tile.type === "ore" ? 3 + Math.floor(depth / 15) : 2;
    }

    for (let i = 0; i < Math.min(12, 3 + Math.floor(depth / 3)); i++) {
        spawnEnemy(map, depth);
    }

    if (depth % 10 === 0) {
        spawnBoss(map, depth);
    }
}

function spawnEnemy(map, depth) {
    const table = depth > 45 ? ["shadow", "skeleton", "bat"] : depth > 20 ? ["skeleton", "bat", "slime"] : ["slime", "bat"];
    const type = table[rand(0, table.length - 1)];
    const data = enemyTypes[type];
    for (let tries = 0; tries < 40; tries++) {
        const x = rand(3, map.width - 4);
        const y = rand(3, map.height - 4);
        if (!blockedInMap(map, x, y)) {
            map.enemies.push({ type, x, y, health: data.health + depth * 3, maxHealth: data.health + depth * 3 });
            return;
        }
    }
}

function spawnBoss(map, depth) {
    const type = depth % 20 === 0 ? "worm" : "golem";
    const data = enemyTypes[type];
    map.enemies.push({ type, x: Math.floor(map.width / 2), y: Math.floor(map.height / 2), health: data.health + depth * 6, maxHealth: data.health + depth * 6, boss: true });
}

function blockedInMap(map, x, y) {
    const tile = tileAt(x, y, map);
    return !tile || isSolidTile(tile) || map.enemies.some((enemy) => enemy.x === x && enemy.y === y);
}

function createNpc(id, name, role, x, y, schedule) {
    return { id, name, role, x, y, targetX: x, targetY: y, friendship: 0, schedule };
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMap() {
    return game.maps[game.currentMap];
}

function tileAt(x, y, map = getMap()) {
    if (x < 0 || y < 0 || x >= map.width || y >= map.height) return null;
    return map.tiles[y][x];
}

function blocked(x, y) {
    const map = getMap();
    const tile = tileAt(x, y, map);
    if (!tile || isSolidTile(tile)) return true;
    return map.npcs.some((npc) => npc.x === x && npc.y === y) ||
        map.enemies.some((enemy) => enemy.x === x && enemy.y === y) ||
        isAnimalAt(x, y);
}

function isSolidTile(tile) {
    return Boolean(tile?.solid || solidTileTypes.has(tile?.type));
}

function isAnimalAt(x, y) {
    return game.currentMap === "farm" && game.animals.some((animal, index) => {
        normalizeAnimal(animal, index);
        return animal.x === x && animal.y === y;
    });
}

function update(dt) {
    animationClock += dt;
    uiState.fade = Math.max(0, uiState.fade - dt / 700);
    if (uiState.screen === "title" || uiState.paused) {
        updateParticles(dt);
        updateFloatingTexts(dt);
        updateAmbientLife(dt);
        return;
    }

    systems.player.update(dt);
    systems.render.updateCamera(dt);
    systems.animal.update(dt);
    systems.weather.update(dt);
    updateAmbientLife(dt);
    updateNpcs();
    updateFishing(dt);
    updateParticles(dt);
    updateFloatingTexts(dt);
    updateCoop(dt);
    updateDayTime(dt);
    updateTutorial();
    updateAutoSave(dt);
    updateCinematicCamera(dt);
    game.stats.hoursPlayed += dt / 3600000;
    messageTimer = Math.max(0, messageTimer - dt);
}

function updateAutoSave(dt) {
    autoSaveTimer += dt;
    if (autoSaveTimer < AUTO_SAVE_INTERVAL_MS) return;
    autoSaveTimer = 0;
    saveGame(1, true);
}

function updateCinematicCamera(dt) {
    if (!uiState.cinematicMode) return;
    const map = getMap();
    const maxX = Math.max(0, map.width * TILE - canvas.width);
    const maxY = Math.max(0, map.height * TILE - canvas.height);
    const t = performance.now() * 0.00008;
    camera.x = clamp((Math.sin(t) * 0.5 + 0.5) * maxX, 0, maxX);
    camera.y = clamp((Math.cos(t * 0.8) * 0.5 + 0.5) * maxY, 0, maxY);
}

function updateDayTime(dt) {
    game.time = (game.time || 600) + dt * 0.045;
    if (game.time >= 2600) {
        nextDay();
        game.time = 600;
        say("You worked past 2:00 AM and went home to sleep.");
    }
}

function getDarkness() {
    const t = game.time || 360;
    if (t < 600 || t >= 2400) return 0.7;
    if (t < 800) return 0.7 - ((t - 600) / 200) * 0.7;
    if (t < 1700) return 0;
    if (t < 2100) return ((t - 1700) / 400) * 0.38;
    return 0.38 + Math.min(0.32, ((t - 2100) / 300) * 0.32);
}

function updateFloatingTexts(dt) {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 0.6 * dt * 0.06;
        ft.alpha -= 0.018 * dt * 0.06;
        if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }
}

function spawnFloatingText(text, worldX, worldY, color = "#f0d568") {
    floatingTexts.push({ text, x: worldX, y: worldY, alpha: 1, color });
}

function setupCoopChannel() {
    if (coopChannel) {
        coopChannel.close();
        coopChannel = null;
    }
    if (!game.multiplayer.enabled || !("BroadcastChannel" in window)) return;
    coopChannel = new BroadcastChannel("mystic-farm-coop");
    coopChannel.onmessage = (event) => {
        const data = event.data;
        if (!data || data.id === game.multiplayer.id) return;
        if (data.type === "player") {
            game.multiplayer.peers[data.id] = {
                x: data.x,
                y: data.y,
                map: data.map,
                time: performance.now()
            };
        }
        if (data.type === "world" && game.multiplayer.role !== "host-tab") {
            game.weather = data.weather;
            game.day = data.day;
            game.season = data.season;
            game.year = data.year;
        }
    };
}

function updateCoop(dt) {
    if (!coopChannel || !game.multiplayer.enabled) return;
    coopTimer += dt;
    if (coopTimer < 120) return;
    coopTimer = 0;
    coopChannel.postMessage({
        type: "player",
        id: game.multiplayer.id,
        x: player.x,
        y: player.y,
        map: game.currentMap
    });
    coopChannel.postMessage({
        type: "world",
        id: game.multiplayer.id,
        day: game.day,
        season: game.season,
        year: game.year,
        weather: game.weather
    });
    Object.entries(game.multiplayer.peers).forEach(([id, peer]) => {
        if (performance.now() - peer.time > 5000) delete game.multiplayer.peers[id];
    });
}

function updatePlayer(dt) {
    player.actionTimer = Math.max(0, (player.actionTimer || 0) - dt);
    let dx = 0;
    let dy = 0;
    const step = player.speed * Math.min(2, dt / 16.67);
    if (keys.w || keys.arrowup) { dy -= step; player.direction = "up"; }
    if (keys.s || keys.arrowdown) { dy += step; player.direction = "down"; }
    if (keys.a || keys.arrowleft) { dx -= step; player.direction = "left"; }
    if (keys.d || keys.arrowright) { dx += step; player.direction = "right"; }
    if (dx && dy) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
    }
    const moving = dx !== 0 || dy !== 0;
    player.moving = moving;
    movePlayer(dx, dy);
    playerAnimator.update(dt, {
        moving: player.moving,
        direction: player.direction,
        usingTool: player.actionTimer > 0
    });
    playerFrame = playerAnimator.getFrame().frame;
}

function movePlayer(dx, dy) {
    if (dx === 0 && dy === 0) return;
    const nextX = player.x + dx;
    const nextY = player.y + dy;
    if (!collidesAt(nextX, player.y)) {
        player.x = nextX;
    }
    if (!collidesAt(player.x, nextY)) {
        player.y = nextY;
    }
}

function collidesAt(px, py) {
    const box = getPlayerCollisionBox(px, py);
    const left = Math.floor(box.x / TILE);
    const right = Math.floor((box.x + box.width - 1) / TILE);
    const top = Math.floor(box.y / TILE);
    const bottom = Math.floor((box.y + box.height - 1) / TILE);
    return blocked(left, top) || blocked(right, top) || blocked(left, bottom) || blocked(right, bottom);
}

function getPlayerCollisionBox(px = player.x, py = player.y) {
    return {
        x: px + 8,
        y: py + 18,
        width: player.width - 16,
        height: player.height - 20
    };
}

function updateCamera() {
    if (uiState.cinematicMode) return;
    const map = getMap();
    const maxX = Math.max(0, map.width * TILE - canvas.width);
    const maxY = Math.max(0, map.height * TILE - canvas.height);
    const targetX = clamp(player.x + player.width / 2 - canvas.width / 2, 0, maxX);
    const targetY = clamp(player.y + player.height / 2 - canvas.height / 2, 0, maxY);
    camera.x += (targetX - camera.x) * 0.12;
    camera.y += (targetY - camera.y) * 0.12;
    camera.shake = Math.max(0, camera.shake - 0.18);
}

function centerCameraOnPlayer() {
    const map = getMap();
    const maxX = Math.max(0, map.width * TILE - canvas.width);
    const maxY = Math.max(0, map.height * TILE - canvas.height);
    camera.x = clamp(player.x + player.width / 2 - canvas.width / 2, 0, maxX);
    camera.y = clamp(player.y + player.height / 2 - canvas.height / 2, 0, maxY);
    camera.shake = 0;
}

function spawnParticle(x, y, color, life = 700, size = 3, vx = 0, vy = -0.4) {
    const particle = particlePool.pop() || {};
    particle.x = x;
    particle.y = y;
    particle.vx = vx;
    particle.vy = vy;
    particle.color = color;
    particle.life = life;
    particle.maxLife = life;
    particle.size = size;
    particle.type = "spark";
    particle.spin = Math.random() * Math.PI * 2;
    if (particles.length < maxParticles) particles.push(particle);
}

function spawnTypedParticle(type, x, y, color, life = 1000, size = 3, vx = 0, vy = 0) {
    const particle = particlePool.pop() || {};
    Object.assign(particle, {
        type,
        x,
        y,
        vx,
        vy,
        color,
        life,
        maxLife: life,
        size,
        spin: Math.random() * Math.PI * 2,
        flap: Math.random() * Math.PI * 2
    });
    if (particles.length < maxParticles) particles.push(particle);
}

function burstParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        spawnParticle(
            x,
            y,
            color,
            rand(360, 820),
            rand(2, 5),
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.8) * 2
        );
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.life -= dt;
        particle.x += particle.vx * dt * 0.06;
        particle.y += particle.vy * dt * 0.06;
        particle.spin += dt * 0.004;
        if (!["rain", "bird", "butterfly", "firefly", "snow", "leaf"].includes(particle.type)) {
            particle.vy += 0.002 * dt;
        }
        if (particle.life <= 0) {
            particles.splice(i, 1);
            particlePool.push(particle);
        }
    }
}

function updateAmbientParticles(dt) {
    if (Math.random() > dt * 0.009) return;
    const x = camera.x + Math.random() * canvas.width;
    const y = camera.y - 12;
    if (game.weather === "Rainy") {
        spawnTypedParticle("rain", x, y, "#8fc7ff", 640, 2, -0.25, 3.2);
    } else if (game.season === "Winter") {
        spawnTypedParticle("snow", x, y, "#f4fbff", 1600, 2, Math.random() - 0.5, 0.6);
    } else if (game.weather === "Windy") {
        spawnTypedParticle("leaf", x, camera.y + Math.random() * canvas.height, "#8fbf6e", 1200, 4, 1.8, -0.2);
    }
}

function updateAmbientLife(dt) {
    ambientLifeTimer += dt;
    if (ambientLifeTimer < 420) return;
    ambientLifeTimer = 0;

    const night = getDarkness() > 0.35;
    if (night && Math.random() < 0.65) {
        spawnTypedParticle(
            "firefly",
            camera.x + rand(40, canvas.width - 40),
            camera.y + rand(90, canvas.height - 80),
            "#f4e978",
            rand(1800, 3200),
            3,
            (Math.random() - 0.5) * 0.45,
            (Math.random() - 0.5) * 0.35
        );
        return;
    }

    if (!night && Math.random() < 0.45) {
        spawnTypedParticle(
            Math.random() < 0.6 ? "butterfly" : "bird",
            camera.x - 20,
            camera.y + rand(70, 360),
            Math.random() < 0.5 ? "#f0d568" : "#d779a7",
            rand(2800, 4200),
            4,
            Math.random() * 1.6 + 0.8,
            (Math.random() - 0.5) * 0.25
        );
    }
}

function drawParticles() {
    particles.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
        if (particle.type === "rain" || particle.vy > 1) {
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(particle.x - camera.x, particle.y - camera.y);
            ctx.lineTo(particle.x - camera.x + particle.vx * 3, particle.y - camera.y + particle.vy * 3);
            ctx.stroke();
        } else if (particle.type === "butterfly") {
            ctx.fillStyle = particle.color;
            const wing = Math.sin(particle.spin * 3) * 3;
            ctx.fillRect(particle.x - camera.x - 3, particle.y - camera.y + wing * 0.2, 3, 3);
            ctx.fillRect(particle.x - camera.x + 2, particle.y - camera.y - wing * 0.2, 3, 3);
        } else if (particle.type === "bird") {
            ctx.strokeStyle = "#263526";
            ctx.lineWidth = 2;
            ctx.beginPath();
            const bx = particle.x - camera.x;
            const by = particle.y - camera.y;
            ctx.moveTo(bx - 5, by);
            ctx.quadraticCurveTo(bx, by - 4, bx + 5, by);
            ctx.stroke();
        } else if (particle.type === "firefly") {
            const glow = 0.4 + Math.sin(particle.spin * 4) * 0.25;
            ctx.fillStyle = `rgba(244,233,120,${glow})`;
            ctx.beginPath();
            ctx.arc(particle.x - camera.x, particle.y - camera.y, particle.size + 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = particle.color;
            if (particle.type === "leaf" || particle.type === "snow") {
                ctx.save();
                ctx.translate(particle.x - camera.x, particle.y - camera.y);
                ctx.rotate(particle.spin);
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                ctx.restore();
            } else {
                ctx.fillRect(particle.x - camera.x, particle.y - camera.y, particle.size, particle.size);
            }
        }
        ctx.restore();
    });
}

function updateNpcs() {
    const map = getMap();
    if (map.id !== "farm") return;
    const time = getSchedulePeriod();
    map.npcs.forEach((npc) => {
        normalizeNpc(npc);
        npc.px += (npc.x - npc.px) * 0.12;
        npc.py += (npc.y - npc.py) * 0.12;
        const target = npc.schedule[time] || npc.schedule.Morning;
        npc.targetX = target[0];
        npc.targetY = target[1];
        if (Math.random() > 0.02) return;
        const next = findNextPathStep(map, npc, npc.targetX, npc.targetY);
        if (next) {
            npc.x = next.x;
            npc.y = next.y;
        }
    });
}

function getSchedulePeriod() {
    const hour = Math.floor((game.time || 600) / 100);
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    if (hour < 20) return "Evening";
    return "Night";
}

function findNextPathStep(map, npc, targetX, targetY) {
    if (npc.x === targetX && npc.y === targetY) return null;

    const startKey = `${npc.x},${npc.y}`;
    const queue = [{ x: npc.x, y: npc.y }];
    const visited = new Set([startKey]);
    const cameFrom = new Map();
    const directions = [
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 }
    ];

    while (queue.length) {
        const current = queue.shift();
        if (current.x === targetX && current.y === targetY) {
            let key = `${current.x},${current.y}`;
            let previous = cameFrom.get(key);
            while (previous && previous !== startKey) {
                key = previous;
                previous = cameFrom.get(key);
            }
            const [x, y] = key.split(",").map(Number);
            return { x, y };
        }

        for (const direction of directions) {
            const x = current.x + direction.x;
            const y = current.y + direction.y;
            const key = `${x},${y}`;
            if (visited.has(key)) continue;
            if (isBlockedForNpcPath(map, x, y, npc, targetX, targetY)) continue;
            visited.add(key);
            cameFrom.set(key, `${current.x},${current.y}`);
            queue.push({ x, y });
        }
    }

    return null;
}

function isBlockedForNpcPath(map, x, y, npc, targetX, targetY) {
    const tile = tileAt(x, y, map);
    if (!tile || isSolidTile(tile)) return true;
    if (x === targetX && y === targetY) return false;
    if (playerTouchesTile(x, y)) return true;
    if (isAnimalAt(x, y)) return true;
    return map.npcs.some((other) => other !== npc && other.x === x && other.y === y) ||
        map.enemies.some((enemy) => enemy.x === x && enemy.y === y);
}

function normalizeNpc(npc) {
    npc.px ??= npc.x;
    npc.py ??= npc.y;
}

function updateAnimals(dt) {
    if (game.currentMap !== "farm") return;
    const map = getMap();

    game.animals.forEach((animal, index) => {
        normalizeAnimal(animal, index);
        animal.px += (animal.x - animal.px) * Math.min(1, dt * 0.006);
        animal.py += (animal.y - animal.py) * Math.min(1, dt * 0.006);
        animal.moveTimer -= dt;

        if (animal.moveTimer > 0) {
            return;
        }

        if (isNightTime()) {
            const behavior = animalAI.chooseBehavior(animal, { isNight: true });
            animal.state = behavior.state;
            animal.moveTimer = behavior.timer;
            return;
        }

        const behavior = animalAI.chooseBehavior(animal, { isNight: false });
        animal.state = behavior.state;
        animal.moveTimer = behavior.timer;
        if (!behavior.step) return;

        const step = behavior.step;
        const nextX = animal.x + step.x;
        const nextY = animal.y + step.y;
        animal.direction = step.direction;

        if (nextX < 9 || nextX > 16 || nextY < 17 || nextY > 20) {
            return;
        }

        const tile = tileAt(nextX, nextY, map);
        const occupied = game.animals.some((other) => other !== animal && other.x === nextX && other.y === nextY);
        const occupiedByPlayer = game.currentMap === "farm" && playerTouchesTile(nextX, nextY);

        if (tile && !isSolidTile(tile) && !occupied && !occupiedByPlayer) {
            animal.x = nextX;
            animal.y = nextY;
        }
    });
}

function isNightTime() {
    const hour = Math.floor((game.time || 600) / 100);
    return hour >= 21 || hour < 6;
}

function updateFishing(dt) {
    if (!player.fishing) return;
    if (player.fishing.phase === "power" && keys[" "]) {
        player.fishing.power = Math.min(100, player.fishing.power + dt * 0.08);
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (camera.shake > 0) {
        ctx.translate((Math.random() - 0.5) * camera.shake, (Math.random() - 0.5) * camera.shake);
    }
    drawMapLayer("ground");
    drawMapLayer("crops");
    drawMapLayer("objects");
    drawActorsByDepth();
    drawMapLayer("treeTops");
    drawCollisionDebug();
    drawParticles();
    drawFloatingTexts();
    drawDayNightOverlay();
    drawNightGlows();
    drawScreenFade();
    ctx.restore();
    drawMinimap();
    drawTutorial();
    drawFishingUi();
    renderHud();
}

function drawActorsByDepth() {
    const actors = [
        { y: player.y + player.height, draw: () => { drawPlayerShadow(); drawPlayer(); } },
        ...getAnimalActors(),
        ...getNpcActors(),
        ...getEnemyActors(),
        ...getRemotePlayerActors()
    ];

    actors.sort((a, b) => a.y - b.y);
    actors.forEach((actor) => actor.draw());
}

function drawPlayerShadow() {
    const sx = player.x - camera.x;
    const sy = player.y - camera.y;
    ctx.save();
    ctx.globalAlpha = 0.38;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(sx + TILE / 2, sy + player.height - 4, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawDayNightOverlay() {
    const dark = getDarkness();
    const tint = getTimeTint();
    if (tint.alpha > 0) {
        ctx.fillStyle = `rgba(${tint.r},${tint.g},${tint.b},${tint.alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (dark <= 0) return;
    ctx.fillStyle = `rgba(10,18,40,${dark})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getTimeTint() {
    const hour = Math.floor((game.time || 600) / 100);
    if (hour >= 6 && hour < 8) return { r: 255, g: 214, b: 154, alpha: 0.1 };
    if (hour >= 17 && hour < 20) return { r: 255, g: 148, b: 82, alpha: 0.16 };
    if (hour >= 20 || hour < 6) return { r: 64, g: 92, b: 170, alpha: 0.18 };
    return { r: 255, g: 255, b: 255, alpha: 0 };
}

function drawNightGlows() {
    if (getDarkness() < 0.25 || game.currentMap !== "farm") return;
    [
        [7.5, 6.8, 120, "rgba(255,198,104,0.28)"],
        [15, 7, 80, "rgba(255,214,130,0.22)"],
        [21, 7, 70, "rgba(180,210,255,0.16)"]
    ].forEach(([tx, ty, radius, color]) => {
        const x = tx * TILE - camera.x;
        const y = ty * TILE - camera.y;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "rgba(255,198,104,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawScreenFade() {
    if (uiState.fade <= 0) return;
    ctx.fillStyle = `rgba(6,10,8,${uiState.fade})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawFloatingTexts() {
    floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x - camera.x, ft.y - camera.y);
        ctx.restore();
    });
}

function drawCollisionDebug() {
    if (!debugConsole.visible) return;

    const map = getMap();
    const startX = Math.max(0, Math.floor(camera.x / TILE));
    const startY = Math.max(0, Math.floor(camera.y / TILE));
    const endX = Math.min(map.width, startX + Math.ceil(canvas.width / TILE) + 2);
    const endY = Math.min(map.height, startY + Math.ceil(canvas.height / TILE) + 2);

    ctx.save();
    ctx.lineWidth = 2;
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const tile = map.tiles[y][x];
            const hasEntity = map.npcs.some((npc) => npc.x === x && npc.y === y) ||
                map.enemies.some((enemy) => enemy.x === x && enemy.y === y) ||
                isAnimalAt(x, y);

            if (!isSolidTile(tile) && !hasEntity) continue;

            ctx.strokeStyle = hasEntity ? "rgba(246, 94, 94, 0.9)" : "rgba(255, 214, 86, 0.8)";
            ctx.strokeRect(x * TILE - camera.x + 3, y * TILE - camera.y + 3, TILE - 6, TILE - 6);
        }
    }

    const box = getPlayerCollisionBox();
    ctx.strokeStyle = "rgba(92, 190, 255, 0.95)";
    ctx.strokeRect(box.x - camera.x, box.y - camera.y, box.width, box.height);
    ctx.fillStyle = "rgba(23, 37, 29, 0.9)";
    ctx.fillRect(box.x - camera.x, box.y - camera.y - 22, 120, 18);
    ctx.fillStyle = "#f8f1d8";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`${Math.floor(player.x / TILE)}, ${Math.floor(player.y / TILE)}`, box.x - camera.x + 4, box.y - camera.y - 8);
    ctx.restore();
}

function getVisibleTileBounds() {
    const map = getMap();
    const startX = Math.max(0, Math.floor(camera.x / TILE));
    const startY = Math.max(0, Math.floor(camera.y / TILE));
    const endX = Math.min(map.width, startX + Math.ceil(canvas.width / TILE) + 2);
    const endY = Math.min(map.height, startY + Math.ceil(canvas.height / TILE) + 2);
    return { map, startX, startY, endX, endY };
}

function drawMapLayer(layer) {
    const { map, startX, startY, endX, endY } = getVisibleTileBounds();
    const target = layer === "objects" ? getTargetTile() : null;

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const tile = map.tiles[y][x];
            const sx = x * TILE - camera.x;
            const sy = y * TILE - camera.y;

            if (layer === "ground") drawGroundTile(tile, sx, sy);
            if (layer === "crops" && tile.crop) drawExternalCrop(tile, sx, sy);
            if (layer === "objects") {
                drawObjectTile(tile, sx, sy, x, y);
                if (isExitTile(x, y)) drawExitMarker(sx, sy);
                if (target && target.x === x && target.y === y) drawTargetHighlight(sx, sy, target);
            }
            if (layer === "treeTops" && tile.type === "tree") drawTreeTop(sx, sy);
        }
    }
}

function isExitTile(x, y) {
    return getMap().exits.some((exit) => exit.x === x && exit.y === y);
}

function drawExitMarker(x, y) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#f0d568";
    ctx.fillRect(x + 18, y + 8, 12, 4);
    ctx.fillRect(x + 22, y + 12, 4, 18);
    ctx.restore();
}

function drawGroundTile(tile, x, y) {
    if (tile.type === "water") {
        drawAnimatedWater(x, y);
    } else if (tile.type === "soil") {
        drawExternalTerrain(tile, x, y);
    } else if (tile.type === "path") {
        drawSprite("path", x, y);
    } else if (tile.type === "townSquare") {
        drawSprite("townSquare", x, y);
    } else if (tile.type === "dock") {
        drawSprite("dock", x, y);
    } else if (tile.type === "stoneFloor") {
        drawSprite("stoneFloor", x, y);
    } else if (isInteriorProp(tile.type) || tile.type === "floor") {
        drawSprite("floor", x, y);
    } else if (tile.type === "wall") {
        drawSprite("wall", x, y);
    } else {
        drawSprite(tile.type === "flower" ? "grass" : "grass", x, y);
        if (tile.type === "flower") drawSheetTile(daneekluAssets.tallgrass, 32, 0, 32, x, y);
    }
    ctx.strokeStyle = "rgba(23,37,29,0.22)";
    ctx.strokeRect(x, y, TILE, TILE);
}

function drawObjectTile(tile, x, y, col, row) {
    if (!["tree", "rock", "ore", "house", "shop", "museum", "mine", "coop", "barn", "shed", "well", "blacksmith", "fence", "stairs", "marker"].includes(tile.type) && !isInteriorProp(tile.type)) {
        if (tile.ore) drawOreSpark(tile, x, y);
        if (tile.marker) drawSprite("marker", x + 10, y - 8, 28, 28);
        return;
    }

    drawTileShadow(tile, x, y);

    if (tile.type === "tree") {
        drawTreeTrunk(x, y);
        return;
    }

    if (tile.type === "rock" || tile.type === "ore") {
        drawSprite(tile.type, x, y);
        drawOreSpark(tile, x, y);
        return;
    }

    if (drawExternalBuilding(tile, x, y, col, row)) return;
    drawSprite(tile.type, x, y);
}

function isInteriorProp(type) {
    return [
        "bed",
        "table",
        "chest",
        "counter",
        "seedRack",
        "toolRack",
        "shippingDesk",
        "anvil",
        "forge",
        "repairBench",
        "stove",
        "animalStall",
        "feedTrough"
    ].includes(type);
}

function drawTargetHighlight(x, y, target) {
    ctx.strokeStyle = game.placementMode
        ? canPlaceBuildingAt(target.x, target.y) ? "#7bd879" : "#df6960"
        : "#f0d568";
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 3, y + 3, TILE - 6, TILE - 6);
    ctx.lineWidth = 1;
}

function drawAnimatedWater(x, y) {
    const t = performance.now() * 0.003;
    const wave = Math.sin(t + x * 0.08 + y * 0.05);
    drawSprite("water", x, y);
    ctx.fillStyle = `rgba(166, 216, 255, ${0.12 + wave * 0.04})`;
    ctx.fillRect(x + 5, y + 8 + wave * 2, TILE - 10, 3);
    ctx.fillRect(x + 10, y + 28 - wave * 2, TILE - 20, 2);
}

function drawOreSpark(tile, x, y) {
    if (!tile.ore) return;
    ctx.fillStyle = tile.ore === "goldOre" ? "#dcbf4c" : tile.ore === "ironOre" ? "#cdd0d4" : "#b36a3e";
    ctx.fillRect(x + 17, y + 17, 14, 14);
}

function drawTreeTrunk(x, y) {
    drawSprite("grass", x, y);
    ctx.fillStyle = "rgba(25,18,12,0.28)";
    ctx.beginPath();
    ctx.ellipse(x + TILE / 2, y + TILE - 8, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#654126";
    ctx.fillRect(x + 20, y + 24, 8, 18);
}

function drawTreeTop(x, y) {
    const bob = Math.sin(performance.now() * 0.002 + x * 0.04) * 1.5;
    ctx.save();
    ctx.translate(0, bob - 14);
    drawSprite("tree", x, y, TILE, TILE + 16);
    ctx.restore();
}

function drawMap() {
    const map = getMap();
    const startX = Math.max(0, Math.floor(camera.x / TILE));
    const startY = Math.max(0, Math.floor(camera.y / TILE));
    const endX = Math.min(map.width, startX + Math.ceil(canvas.width / TILE) + 2);
    const endY = Math.min(map.height, startY + Math.ceil(canvas.height / TILE) + 2);
    const target = getTargetTile();

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const tile = map.tiles[y][x];
            const sx = x * TILE - camera.x;
            const sy = y * TILE - camera.y;
            drawTile(tile, sx, sy, x, y);
            if (target && target.x === x && target.y === y) {
                ctx.strokeStyle = game.placementMode
                    ? canPlaceBuildingAt(target.x, target.y) ? "#7bd879" : "#df6960"
                    : "#f0d568";
                ctx.lineWidth = 3;
                ctx.strokeRect(sx + 3, sy + 3, TILE - 6, TILE - 6);
                ctx.lineWidth = 1;
            }
        }
    }
}

function drawTile(tile, x, y, col = 0, row = 0) {
    if (drawExternalBuilding(tile, x, y, col, row)) {
        ctx.strokeStyle = "rgba(23,37,29,0.34)";
        ctx.strokeRect(x, y, TILE, TILE);
        return;
    }

    drawTileShadow(tile, x, y);

    if (!drawExternalTerrain(tile, x, y)) {
        drawSprite(tile.watered ? "watered" : tile.type, x, y);
    }
    ctx.strokeStyle = "rgba(23,37,29,0.34)";
    ctx.strokeRect(x, y, TILE, TILE);

    if (tile.crop) {
        drawExternalCrop(tile, x, y);
    }

    if (tile.ore) {
        ctx.fillStyle = tile.ore === "goldOre" ? "#dcbf4c" : tile.ore === "ironOre" ? "#cdd0d4" : "#b36a3e";
        ctx.fillRect(x + 17, y + 17, 14, 14);
    }
}

function drawTileShadow(tile, x, y) {
    if (tile.type !== "tree" && tile.type !== "rock" && tile.type !== "ore" && !getBuildingIcon(tile.type)) return;
    ctx.save();
    ctx.globalAlpha = getBuildingIcon(tile.type) ? 0.18 : tile.type === "tree" ? 0.28 : 0.2;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(x + TILE / 2, y + TILE - 9, getBuildingIcon(tile.type) ? 22 : tile.type === "tree" ? 20 : 14, getBuildingIcon(tile.type) ? 8 : tile.type === "tree" ? 7 : 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawExternalTerrain(tile, x, y) {
    if (tile.type === "grass") {
        drawSprite("grass", x, y);
        return true;
    }

    if (tile.type === "flower") {
        drawSprite("grass", x, y);
        return drawSheetTile(daneekluAssets.tallgrass, 32, 0, 32, x, y);
    }

    if (tile.type === "soil") {
        const drawn = drawSheetTile(daneekluAssets.plowedSoil, tile.watered ? 32 : 0, 0, 32, x, y);
        if (drawn && tile.watered) {
            ctx.fillStyle = "rgba(88, 135, 180, 0.22)";
            ctx.fillRect(x, y, TILE, TILE);
        }
        return drawn;
    }

    if (tile.type === "fence") {
        return drawSheetTile(daneekluAssets.fence, 0, 0, 32, x, y);
    }

    return false;
}

function getCropStage(tile) {
    const crop = crops[tile.crop];
    const ratio = tile.growth / crop.days;
    if (ratio >= 1) return 3;
    if (ratio >= 0.66) return 2;
    if (ratio >= 0.33) return 1;
    return 0;
}

function drawExternalCrop(tile, x, y) {
    const crop = crops[tile.crop];
    const stage = getCropStage(tile);
    const mature = stage === 3;
    const sway = Math.sin(performance.now() * 0.004 + x * 0.03) * (1 + stage);

    ctx.save();
    ctx.translate(sway, 0);

    if (tile.crop === "wheat") {
        const sheet = mature ? daneekluAssets.wheat : daneekluAssets.youngwheat;
        const frameX = mature ? stage * 32 : (stage < 2 ? 0 : 32);
        if (drawSheetTile(sheet, frameX, 0, 32, x, y)) {
            ctx.restore();
            return;
        }
    }

    if (drawSheetTile(daneekluAssets.plants, getPlantFrameX(tile.crop), stage * 32, 32, x, y)) {
        ctx.restore();
        return;
    }

    const sizeFactor = 0.3 + stage * 0.23;
    ctx.fillStyle = crop.color;
    ctx.beginPath();
    ctx.ellipse(x + TILE / 2, y + TILE / 2, 8 + 10 * sizeFactor, 12 + 8 * sizeFactor, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawSheetTile(sheet, sx, sy, size, x, y) {
    if (!imageReady(sheet)) {
        return false;
    }

    ctx.drawImage(sheet, sx, sy, size, size, x, y, TILE, TILE);
    return true;
}

function getPlantFrameX(cropKey) {
    const order = ["carrot", "potato", "tomato", "pumpkin"];
    return Math.max(0, order.indexOf(cropKey)) * 32;
}

function drawExternalBuilding(tile, x, y, col = 0, row = 0) {
    const icon = getBuildingIcon(tile.type);

    if (imageReady(icon)) {
        drawBuildingIconTile(icon, tile.type, x, y, col, row);
        return true;
    }

    const frame = lpcBuildingFrames[tile.type];
    const sheet = buildingAssets.farmSheet;

    if (!frame || !imageReady(sheet)) {
        return false;
    }

    ctx.drawImage(sheet, frame.sx, frame.sy, frame.sw, frame.sh, x, y, TILE, TILE);
    return true;
}

function drawBuildingIconTile(icon, type, x, y, col, row) {
    if (type === "house" && col >= 5 && col <= 8 && row >= 4 && row <= 6) {
        const sx = (col - 5) * (icon.naturalWidth / 4);
        const sy = (row - 4) * (icon.naturalHeight / 3);
        ctx.drawImage(icon, sx, sy, icon.naturalWidth / 4, icon.naturalHeight / 3, x, y, TILE, TILE);
        return;
    }

    if (type === "barn") {
        const originCol = 9;
        const originRow = 15;
        const sx = Math.max(0, Math.min(2, col - originCol)) * (icon.naturalWidth / 3);
        const sy = Math.max(0, Math.min(1, row - originRow)) * (icon.naturalHeight / 2);
        ctx.drawImage(icon, sx, sy, icon.naturalWidth / 3, icon.naturalHeight / 2, x, y, TILE, TILE);
        return;
    }

    ctx.drawImage(icon, x, y, TILE, TILE);
}

function getBuildingIcon(type) {
    if (type === "barn" || type === "coop" || type === "shed") return buildingAssets.barnIcon;
    if (type === "house") return buildingAssets.houseIcon;
    if (type === "shop") return buildingAssets.shopIcon;
    return null;
}

function drawPlayer() {
    const sx = player.x - camera.x;
    const bob = player.moving
        ? Math.sin(animationClock * 0.018) * 2
        : Math.sin(animationClock * 0.004) * 1;
    const sy = player.y - camera.y + bob;
    if (imageReady(characterAssets.player)) {
        if (characterAssets.player.naturalWidth <= 48 || characterAssets.player.naturalHeight <= 64) {
            ctx.drawImage(characterAssets.player, sx + 8, sy, 32, 48);
            drawPlayerFeet(sx, sy);
            drawToolSwing(sx, sy);
            return;
        }

        const dirRow = { down: 0, left: 1, right: 2, up: 3 }[player.direction] ?? 0;
        const frameW = characterAssets.player.naturalWidth / 4;
        const frameH = characterAssets.player.naturalHeight / 4;
        ctx.drawImage(characterAssets.player, playerFrame * frameW, dirRow * frameH, frameW, frameH, sx, sy, TILE, TILE);
        drawToolSwing(sx, sy);
        return;
    }
    drawAnimatedFallbackPlayer(sx, sy);
    drawToolSwing(sx, sy);
}

function drawPlayerFeet(x, y) {
    if (!player.moving) return;
    const step = Math.sin(animationClock * 0.022) * 3;
    ctx.fillStyle = "#263526";
    ctx.fillRect(x + 15 + step, y + 41, 5, 5);
    ctx.fillRect(x + 27 - step, y + 41, 5, 5);
}

function drawAnimatedFallbackPlayer(x, y) {
    const walk = player.moving ? Math.sin(animationClock * 0.022) : 0;
    ctx.fillStyle = "#263526";
    ctx.beginPath();
    ctx.ellipse(x + TILE / 2, y + TILE - 6, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#273f8f";
    ctx.fillRect(x + 15, y + 18, 18, 20);
    ctx.fillStyle = "#f0bd8b";
    ctx.fillRect(x + 16, y + 7, 16, 13);
    ctx.fillStyle = "#3a2a21";
    ctx.fillRect(x + 14, y + 5, 20, 5);
    ctx.fillStyle = "#1d2a52";
    ctx.fillRect(x + 14 + walk * 3, y + 37, 6, 8);
    ctx.fillRect(x + 28 - walk * 3, y + 37, 6, 8);
}

function drawToolSwing(x, y) {
    if (!player.actionTimer) return;
    const progress = 1 - player.actionTimer / 180;
    const reach = 22 + progress * 8;
    const offsets = {
        up: [TILE / 2, 8 - reach],
        down: [TILE / 2, 30 + reach],
        left: [8 - reach, TILE / 2],
        right: [34 + reach, TILE / 2]
    };
    const [ox, oy] = offsets[player.direction] || offsets.down;
    ctx.save();
    ctx.globalAlpha = Math.max(0, player.actionTimer / 180);
    ctx.strokeStyle = "#f0d568";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x + ox, y + oy, 10, progress * Math.PI, progress * Math.PI + Math.PI * 0.9);
    ctx.stroke();
    ctx.restore();
}

function drawAnimals() {
    if (game.currentMap !== "farm") return;

    game.animals.forEach((animal, index) => {
        normalizeAnimal(animal, index);
        const x = animal.px * TILE - camera.x;
        const y = animal.py * TILE - camera.y;
        drawAnimalShadow(animal, x, y);
        drawAnimalSprite(animal, x, y);
    });
}

function getAnimalActors() {
    if (game.currentMap !== "farm") return [];
    return game.animals.map((animal, index) => {
        normalizeAnimal(animal, index);
        return {
            y: animal.py * TILE + TILE,
            draw: () => {
                const x = animal.px * TILE - camera.x;
                const y = animal.py * TILE - camera.y;
                drawAnimalShadow(animal, x, y);
                drawAnimalSprite(animal, x, y);
            }
        };
    });
}

function getNpcActors() {
    const map = getMap();
    return map.npcs.map((npc) => ({
        y: npc.y * TILE + TILE,
        draw: () => drawNpc(npc)
    }));
}

function getEnemyActors() {
    const map = getMap();
    return map.enemies.map((enemy) => ({
        y: enemy.y * TILE + TILE,
        draw: () => drawEnemy(enemy)
    }));
}

function getRemotePlayerActors() {
    return Object.values(game.multiplayer.peers)
        .filter((peer) => peer.map === game.currentMap)
        .map((peer) => ({
            y: peer.y + TILE,
            draw: () => drawRemotePlayer(peer)
        }));
}

function normalizeAnimal(animal, index) {
    animal.type = String(animal.type || "chicken").toLowerCase();
    animal.x ??= 10 + index;
    animal.y ??= 17 + (index % 2);
    animal.px ??= animal.x;
    animal.py ??= animal.y;
    animal.state ||= animal.fed ? "walk" : "eat";
    animal.direction ||= index % 2 ? "right" : "left";
    animal.moveTimer ??= rand(300, 1200);
}

function drawAnimalShadow(animal, x, y) {
    const shadow = animalAssets[animal.type]?.shadow;

    if (imageReady(shadow)) {
        const frame = getAnimalFrame(shadow, animal);
        ctx.globalAlpha = 0.55;
        ctx.drawImage(shadow, frame.sx, frame.sy, frame.sw, frame.sh, x + 4, y + 28, TILE - 8, 14);
        ctx.globalAlpha = 1;
        return;
    }

    ctx.fillStyle = "rgba(20, 16, 18, 0.35)";
    ctx.beginPath();
    ctx.ellipse(x + TILE / 2, y + TILE - 9, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawAnimalSprite(animal, x, y) {
    const state = animal.state === "sleep" || animal.state === "idle" ? "eat" : animal.state;
    const sheet = animalAssets[animal.type]?.[state] || animalAssets[animal.type]?.walk;

    if (!imageReady(sheet)) {
        drawSprite("npc", x, y);
        return;
    }

    const frame = getAnimalFrame(sheet, animal);
    if (animal.state === "sleep") {
        ctx.globalAlpha = 0.78;
    }
    ctx.drawImage(sheet, frame.sx, frame.sy, frame.sw, frame.sh, x, y, TILE, TILE);
    ctx.globalAlpha = 1;
    if (animal.state === "sleep") {
        ctx.fillStyle = "#f8f1d8";
        ctx.font = "bold 12px Arial";
        ctx.fillText("Z", x + TILE - 10, y + 10);
    }
}

function getAnimalFrame(sheet, animal) {
    const frameWidth = sheet.naturalWidth / 4;
    const frameHeight = sheet.naturalHeight / 4;
    const rowByDirection = {
        up: 0,
        right: 1,
        down: 2,
        left: 3
    };
    const frame = Math.floor(performance.now() / 180 + animal.x + animal.y) % 4;
    const row = rowByDirection[animal.direction] ?? 2;

    return {
        sx: frame * frameWidth,
        sy: row * frameHeight,
        sw: frameWidth,
        sh: frameHeight
    };
}

function drawNpcs() {
    const map = getMap();
    map.npcs.forEach(drawNpc);
}

function drawNpc(npc) {
    normalizeNpc(npc);
    const x = npc.px * TILE - camera.x;
    const y = npc.py * TILE - camera.y;
    ctx.save();
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(x + TILE / 2, y + TILE - 5, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const portrait = characterAssets[npc.id];
    if (imageReady(portrait)) {
        ctx.drawImage(portrait, x, y, TILE, TILE);
    } else {
        drawSprite("npc", x, y);
    }
    ctx.fillStyle = "#f8f1d8";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(npc.name, x + TILE / 2, y - 4);
}

function drawEnemies() {
    const map = getMap();
    map.enemies.forEach(drawEnemy);
}

function drawEnemy(enemy) {
    const data = enemyTypes[enemy.type];
    const x = enemy.x * TILE - camera.x;
    const y = enemy.y * TILE - camera.y;
    ctx.fillStyle = data.color;
    ctx.fillRect(x + 8, y + 9, TILE - 16, TILE - 16);
    ctx.fillStyle = "#171717";
    ctx.fillRect(x + 10, y + 4, TILE - 20, 5);
    ctx.fillStyle = enemy.boss ? "#df6960" : "#f0d568";
    ctx.fillRect(x + 10, y + 4, (TILE - 20) * (enemy.health / enemy.maxHealth), 5);
    ctx.fillStyle = "#f8f1d8";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(data.name, x + TILE / 2, y - 4);
}

function drawRemotePlayers() {
    Object.values(game.multiplayer.peers).forEach(drawRemotePlayer);
}

function drawRemotePlayer(peer) {
    if (peer.map !== game.currentMap) return;
    ctx.globalAlpha = 0.72;
    drawSprite("player", peer.x - camera.x, peer.y - camera.y);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#a6d8ff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("P2", peer.x - camera.x + TILE / 2, peer.y - camera.y - 4);
}

function drawFishingUi() {
    if (!player.fishing) return;
    const x = canvas.width / 2 - 150;
    const y = canvas.height - 80;
    ctx.fillStyle = "rgba(23,37,29,0.86)";
    ctx.fillRect(x, y, 300, 42);
    ctx.strokeStyle = "#f0d568";
    ctx.strokeRect(x, y, 300, 42);
    ctx.fillStyle = "#f0d568";
    ctx.fillRect(x + 12, y + 14, 276 * (player.fishing.power / 100), 14);
    ctx.fillStyle = "#f8f1d8";
    ctx.font = "14px Arial";
    ctx.fillText("Hold SPACE, release to cast", x + 82, y + 29);
}

function updateTutorial() {
    game.tutorial ??= {};
    if (player.moving) game.tutorial.moved = true;
    if (player.actionTimer > 0) game.tutorial.interacted = true;
    if (getMap().id === "farm") {
        game.tutorial.planted ||= getMap().tiles.some((row) => row.some((tile) => tile.crop));
    }
    game.tutorial.harvested ||= game.stats.cropsHarvested > 0;
    game.tutorial.dismissed ||= game.tutorial.moved && game.tutorial.interacted && game.tutorial.planted && game.tutorial.harvested;
}

function drawMinimap() {
    if (!uiState.minimapVisible || uiState.screenshotMode || uiState.cinematicMode || uiState.screen === "title") return;

    const map = getMap();
    const width = 172;
    const height = 118;
    const x = canvas.width - width - 24;
    const y = 24;
    const scaleX = width / map.width;
    const scaleY = height / map.height;

    ctx.save();
    drawPanel(x, y, width, height, 0.82);
    ctx.textAlign = "left";
    for (let row = 0; row < map.height; row++) {
        for (let col = 0; col < map.width; col++) {
            const tile = map.tiles[row][col];
            ctx.fillStyle = getMinimapColor(tile);
            ctx.fillRect(x + col * scaleX, y + row * scaleY, Math.ceil(scaleX), Math.ceil(scaleY));
        }
    }
    ctx.fillStyle = "#f8f1d8";
    ctx.beginPath();
    ctx.arc(x + (player.x / TILE) * scaleX, y + (player.y / TILE) * scaleY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "12px Arial";
    ctx.fillText("M Map", x + 10, y + height - 10);
    ctx.restore();
}

function getMinimapColor(tile) {
    if (tile.type === "water") return "#2e6f9e";
    if (tile.type === "path" || tile.type === "dock" || tile.type === "townSquare") return "#9b8158";
    if (tile.type === "tree") return "#2f6f39";
    if (tile.type === "rock" || tile.type === "ore" || tile.type === "mine") return "#62676f";
    if (isSolidTile(tile)) return "#8a5a45";
    if (tile.crop) return "#d7b34a";
    return "#4d9a46";
}

function drawTutorial() {
    const tutorial = game.tutorial || {};
    if (tutorial.dismissed || uiState.screenshotMode || uiState.cinematicMode || uiState.screen === "title") return;

    const items = [
        ["WASD move", tutorial.moved],
        [`${settings.interactKey.toUpperCase()} use tool`, tutorial.interacted],
        ["Plant a crop", tutorial.planted],
        ["Harvest once", tutorial.harvested]
    ];
    const x = 24;
    const y = canvas.height - 176;
    drawPanel(x, y, 210, 136, 0.86);
    ctx.textAlign = "left";
    ctx.fillStyle = "#f8f1d8";
    ctx.font = "bold 16px Arial";
    ctx.fillText("First Day Guide", x + 16, y + 26);
    ctx.font = "14px Arial";
    items.forEach(([text, done], index) => {
        ctx.fillStyle = done ? "#9fd67f" : "#f8f1d8";
        ctx.fillText(`${done ? "OK" : "--"} ${text}`, x + 16, y + 54 + index * 20);
    });
}

function drawPanel(x, y, width, height, alpha = 0.9) {
    ctx.fillStyle = `rgba(23,37,29,${alpha})`;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "#6e8a5b";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
}

function drawMessage() {
    if (!message) return;
    ctx.fillStyle = "rgba(23,37,29,0.86)";
    ctx.fillRect(canvas.width / 2 - 260, 18, 520, 40);
    ctx.strokeStyle = "#5f7d55";
    ctx.strokeRect(canvas.width / 2 - 260, 18, 520, 40);
    ctx.fillStyle = "#f8f1d8";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, 44);
}

function getTargetTile() {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    let x = Math.floor(centerX / TILE);
    let y = Math.floor(centerY / TILE);
    if (player.direction === "up") y--;
    if (player.direction === "down") y++;
    if (player.direction === "left") x--;
    if (player.direction === "right") x++;
    return tileAt(x, y) ? { x, y, tile: tileAt(x, y) } : null;
}

function interact() {
    if (player.fishing) return;
    const target = getTargetTile();
    if (!target) return;
    const npc = getNpcAt(target.x, target.y);
    if (npc) {
        openDialogue(npc);
        return;
    }
    const enemy = getEnemyAt(target.x, target.y);
    if (enemy) {
        attackEnemy(enemy);
        return;
    }

    if (game.placementMode) {
        placeBuilding(target.x, target.y);
        return;
    }

    const exit = getMap().exits.find((item) => item.x === target.x && item.y === target.y);
    if (exit) {
        if (game.currentMap === "farm") {
            mapManager.enterMap(exit.to, exit.spawn);
        } else {
            mapManager.exitMap(exit.to, exit.spawn);
        }
        return;
    }

    if (target.tile.type === "bed") {
        nextDay();
        say("You slept until morning.");
        return;
    }

    if (target.tile.type === "chest") {
        openStorageChest();
        return;
    }

    if (target.tile.type === "table" || target.tile.type === "stove") {
        cookSelectedRecipe();
        return;
    }

    if (target.tile.type === "seedRack" || target.tile.type === "counter") {
        buySelectedSeed();
        return;
    }

    if (target.tile.type === "shippingDesk") {
        shipGoods();
        return;
    }

    if (target.tile.type === "toolRack") {
        buyTool();
        return;
    }

    if (target.tile.type === "anvil" || target.tile.type === "forge") {
        upgradeCurrentTool();
        return;
    }

    if (target.tile.type === "repairBench") {
        repairTools();
        return;
    }

    if (target.tile.type === "animalStall" || target.tile.type === "feedTrough") {
        collectAnimalProducts();
        return;
    }

    if (target.tile.type === "shop") {
        buySelectedSeed();
        return;
    }

    if (target.tile.type === "museum") {
        donateToMuseum();
        return;
    }

    if (target.tile.type === "coop") {
        collectAnimalProducts();
        return;
    }

    if (target.tile.type === "water" || player.tool === "rod") {
        startFishing(target.tile);
        return;
    }

    if (target.tile.type === "stairs" && game.currentMap === "mine") {
        game.mineDepth++;
        generateMineLevel(game.mineDepth);
        player.x = 3 * TILE;
        player.y = 3 * TILE;
        say(`Descended to Mine ${game.mineDepth}.`);
        return;
    }

    useTool(target.tile, target.x, target.y);
}

function useTool(tile, x, y) {
    if (player.energy <= 0) {
        say("Too tired. Sleep to recover.");
        return;
    }

    player.actionTimer = 180;
    player.actionTool = player.tool;

    if (player.tool === "hoe" && tile.type === "grass" && !tile.resource) {
        tile.type = "soil";
        spendEnergy(2);
        gainXp("farming", 1);
        burstParticles(x * TILE + TILE / 2, y * TILE + TILE / 2, "#8a5a35", 8);
        playSfx("plant");
    } else if (player.tool === "water" && tile.type === "soil") {
        tile.watered = true;
        spendEnergy(1);
        burstParticles(x * TILE + TILE / 2, y * TILE + TILE / 2, "#8fc7ff", 8);
        playSfx("water");
    } else if (player.tool === "seed" && tile.type === "soil" && tile.watered && !tile.crop) {
        plantCrop(tile);
    } else if (player.tool === "hand" && tile.crop && tile.growth >= crops[tile.crop].days) {
        addItem(tile.crop, 1);
        say(`${crops[tile.crop].name} harvested.`);
        burstParticles(x * TILE + TILE / 2, y * TILE + TILE / 2, "#f0d568", 14);
        spawnFloatingText(`+1 ${crops[tile.crop].name}`, x * TILE + TILE / 2, y * TILE);
        camera.shake = 2;
        playSfx("harvest");
        game.stats.cropsHarvested++;
        if (game.talents.doubleHarvest && Math.random() < 0.12) addItem(tile.crop, 1);
        tile.crop = null;
        tile.type = "soil";
        tile.watered = false;
        spendEnergy(3);
        gainXp("farming", 8);
    } else if (player.tool === "axe" && tile.resource === "tree") {
        burstParticles(x * TILE + TILE / 2, y * TILE + TILE / 2, "#8b5a2b", 8);
        hitResource(tile, "wood", 3, "axe");
    } else if (player.tool === "pickaxe" && (tile.resource === "rock" || tile.resource === "ore")) {
        burstParticles(x * TILE + TILE / 2, y * TILE + TILE / 2, "#aaa9a4", 8);
        hitResource(tile, tile.ore || "stone", tile.ore ? 2 : 3, "pickaxe");
    }
    saveGame(1, true);
}

function plantCrop(tile) {
    const crop = crops[game.selectedCrop];
    if (!crop.season.includes(game.season)) {
        say("That crop cannot grow this season.");
        return;
    }
    if (!hasItem(crop.seed, 1)) {
        say(`No ${crop.name} seeds.`);
        return;
    }
    removeItem(crop.seed, 1);
    tile.crop = game.selectedCrop;
    tile.growth = 0;
    spendEnergy(1);
    say(`${crop.name} planted.`);
    playSfx("plant");
    checkAchievements();
}

function hitResource(tile, drop, qty, tool) {
    tile.hp -= game.toolTier[tool] === "Gold" ? 3 : game.toolTier[tool] === "Iron" ? 2 : 1;
    spendEnergy(tool === "axe" ? 5 : 5);
    camera.shake = tool === "pickaxe" ? 4 : 2;
    playSfx(tool === "pickaxe" ? "mine" : "chop");
    burstParticles(player.x + TILE / 2, player.y + TILE / 2, tool === "axe" ? "#8fbf6e" : "#aaa9a4", 6);
    if (tile.hp <= 0) {
        const bonus = game.talents.extraOre && tool === "pickaxe" ? 1 : 0;
        addItem(drop, qty + bonus);
        tile.type = getMap().id === "mine" ? "stoneFloor" : "grass";
        tile.solid = false;
        tile.resource = null;
        tile.ore = null;
        if (tool === "axe") game.stats.treesChopped++;
        if (tool === "pickaxe") game.stats.rocksBroken++;
        say(`+${qty + bonus} ${label(drop)}`);
        gainXp(tool === "axe" ? "farming" : "mining", 6);
    }
}

function startFishing(tile) {
    if (player.tool !== "rod" && tile.type !== "water") {
        say("Face water to fish.");
        return;
    }
    player.fishing = { phase: "power", power: 0 };
    say("Fishing started.");
}

function finishFishing() {
    if (!player.fishing) return;
    const power = player.fishing.power;
    player.fishing = null;
    if (power < 20) {
        say("The cast was too weak.");
        return;
    }
    const catchId = rollFish();
    addItem(catchId, 1);
    if (!game.collections.fish.includes(catchId)) game.collections.fish.push(catchId);
    game.stats.fishCaught++;
    gainXp("fishing", 10);
    spendEnergy(4);
    playSfx("fish");
    checkAchievements();
    say(`Caught ${label(catchId)}.`);
}

function rollFish() {
    const seasonal = {
        Spring: ["sardine", "carp"],
        Summer: ["bass", "tuna"],
        Fall: ["pufferfish", "catfish"],
        Winter: ["icefish", "lingcod"]
    };
    const legendary = ["goldenKoi", "moonCarp", "ancientTuna", "crystalSalmon"];
    const legendaryChance = game.talents.rareFish ? 0.1 : 0.05;
    if (Math.random() < legendaryChance) {
        const available = legendary.find((fish) => !game.collections.fish.includes(fish));
        if (available) return available;
    }
    const list = seasonal[game.season] || seasonal.Spring;
    return list[rand(0, list.length - 1)];
}

function getNpcAt(x, y) {
    return getMap().npcs.find((npc) => npc.x === x && npc.y === y);
}

function getEnemyAt(x, y) {
    return getMap().enemies.find((enemy) => enemy.x === x && enemy.y === y);
}

function attackEnemy(enemy) {
    const weapon = equipment[player.equipment.weapon] || equipment.rustySword;
    enemy.health -= player.attack + (weapon.attack || 0);
    if (enemy.health <= 0) {
        defeatEnemy(enemy);
        return;
    }
    const data = enemyTypes[enemy.type];
    const boots = equipment[player.equipment.boots] || {};
    const damage = Math.max(1, data.damage - player.defense - (boots.defense || 0));
    player.health = Math.max(0, player.health - damage);
    say(`${data.name} hit you for ${damage}.`);
    if (player.health <= 0) {
        passOut();
    }
}

function defeatEnemy(enemy) {
    const map = getMap();
    const data = enemyTypes[enemy.type];
    map.enemies = map.enemies.filter((item) => item !== enemy);
    addItem(data.loot, enemy.boss ? 3 : 1);
    if (enemy.boss) {
        game.stats.bossesDefeated++;
        game.reputation += 4;
        addItem(enemy.type === "golem" ? "ironSword" : "harvestRing", 1);
    }
    game.stats.enemiesDefeated++;
    gainXp("mining", enemy.boss ? 50 : 12);
    camera.shake = enemy.boss ? 8 : 4;
    playSfx("quest");
    checkAchievements();
    say(`${data.name} defeated.`);
}

function passOut() {
    const loss = Math.ceil(game.gold * 0.05);
    game.gold = Math.max(0, game.gold - loss);
    player.health = player.maxHealth;
    player.energy = 30;
    switchMap("farm", [7, 8]);
    say(`You passed out and lost ${loss}g.`);
}

function canPlaceBuildingAt(x, y) {
    const tile = tileAt(x, y);
    return Boolean(game.placementMode && tile && !isSolidTile(tile) && !tile.crop && !playerTouchesTile(x, y));
}

function playerTouchesTile(x, y) {
    const box = getPlayerCollisionBox();
    const left = Math.floor(box.x / TILE);
    const right = Math.floor((box.x + box.width - 1) / TILE);
    const top = Math.floor(box.y / TILE);
    const bottom = Math.floor((box.y + box.height - 1) / TILE);
    return x >= left && x <= right && y >= top && y <= bottom;
}

function ensurePlayerOnWalkableTile() {
    if (!collidesAt(player.x, player.y)) return;

    const map = getMap();
    const startX = clamp(Math.floor(player.x / TILE), 1, map.width - 2);
    const startY = clamp(Math.floor(player.y / TILE), 1, map.height - 2);

    for (let radius = 0; radius < Math.max(map.width, map.height); radius++) {
        for (let y = startY - radius; y <= startY + radius; y++) {
            for (let x = startX - radius; x <= startX + radius; x++) {
                if (x < 1 || y < 1 || x >= map.width - 1 || y >= map.height - 1) continue;
                if (blocked(x, y)) continue;

                player.x = x * TILE;
                player.y = y * TILE;
                return;
            }
        }
    }
}

function placeBuilding(x, y) {
    if (!canPlaceBuildingAt(x, y)) {
        say("Blocked placement.");
        return;
    }
    const build = buildables[game.placementMode];
    if (!canAfford(build.cost)) {
        say("Missing building materials.");
        return;
    }
    payCost(build.cost);
    const tile = tileAt(x, y);
    tile.type = build.type;
    tile.solid = build.type !== "path";
    tile.resource = null;
    game.placementMode = null;
    game.reputation++;
    say(`${build.name} placed.`);
    renderPanels();
}

function openDialogue(npc) {
    npc.friendship = Math.min(10, npc.friendship + 1);
    document.getElementById("dialogueTitle").textContent = `${npc.name} - ${npc.role}`;
    document.getElementById("dialogueText").textContent = npc.friendship > 5
        ? "I always look forward to seeing you around town."
        : "Good to see you. The valley feels busier every day.";
    const actions = document.getElementById("dialogueActions");
    actions.innerHTML = "";
    ["honey", "wheat", "wood"].forEach((gift) => {
        const button = document.createElement("button");
        button.textContent = `Gift ${label(gift)}`;
        button.disabled = !hasItem(gift, 1);
        button.onclick = () => {
            removeItem(gift, 1);
            npc.friendship = Math.min(10, npc.friendship + (gift === "honey" ? 2 : 1));
            document.getElementById("dialogueText").textContent = `${npc.name} appreciates the gift.`;
            renderPanels();
        };
        actions.appendChild(button);
    });
    const close = document.createElement("button");
    close.textContent = "Close";
    close.onclick = closeDialogue;
    actions.appendChild(close);
    document.getElementById("dialogue").classList.add("visible");
}

function closeDialogue() {
    document.getElementById("dialogue").classList.remove("visible");
}

function switchMap(mapId, spawn) {
    mapManager.transitionToMap(mapId, spawn);
}

function nextDay() {
    game.day++;
    game.time = 600;
    player.energy = 100;
    player.health = Math.min(player.maxHealth, player.health + 15);
    if (game.day > 28) {
        game.day = 1;
        const next = seasons.indexOf(game.season) + 1;
        game.season = seasons[next] || "Spring";
        if (game.season === "Spring") game.year++;
    }
    game.weather = weatherTypes[rand(0, weatherTypes.length - 1)];
    rollMarket();
    updateFestival();
    Object.values(game.maps).forEach((map) => {
        map.tiles.flat().forEach((tile) => {
            if (tile.crop && (tile.watered || game.weather === "Rainy")) {
                tile.growth += game.talents.farmingSpeed ? 1.2 : 1;
            }
            if (tile.type === "soil") tile.watered = game.weather === "Rainy";
        });
    });
    game.animals.forEach((animal) => {
        animal.age++;
        animal.happiness += animal.fed ? 2 : -8;
        animal.happiness = clamp(animal.happiness, 0, 100);
        animal.fed = hasItem("hay", 1);
        if (animal.fed) removeItem("hay", 1);
    });
    petDailyFind();
    say(`Day ${game.day}. ${game.weather}.`);
    saveGame(1, true);
}

function collectAnimalProducts() {
    game.animals.forEach((animal) => {
        if (animal.type === "chicken") addItem("egg", animal.happiness > 70 ? 2 : 1);
        if (animal.type === "cow") addItem("milk", animal.happiness > 70 ? 2 : 1);
        if (animal.type === "sheep") addItem("wool", 1);
        if (animal.type === "pig") addItem("truffle", 1);
        if (animal.type === "llama") addItem("llamaWool", 1);
    });
    say("Collected animal products.");
}

function rollMarket() {
    Object.entries(crops).forEach(([id, crop]) => {
        const bonus = game.talents.farmingValue ? 1.1 : 1;
        const ring = equipment[player.equipment.ring] || {};
        const ringBonus = ring.cropValue || 0;
        const festivalBonus = game.activeFestival?.reward === "cropValue" ? 1.2 : 1;
        game.market[id] = Math.round((crop.sell + rand(-30, 30)) * bonus * (1 + ringBonus) * festivalBonus);
    });
}

function updateFestival() {
    game.activeFestival = festivals.find((festival) => festival.day === game.day && festival.season === game.season) || null;
    if (!game.activeFestival) return;
    if (game.activeFestival.reward === "reputation") game.reputation += 2;
    if (game.activeFestival.reward === "gold") game.gold += 250;
    if (game.activeFestival.reward === "rareItem") addItem("magicCrystal", 1);
    say(`${game.activeFestival.name} is today.`);
}

function petDailyFind() {
    game.pet.happiness = clamp(game.pet.happiness + 2, 0, 100);
    game.pet.foundToday = false;
    if (Math.random() > game.pet.happiness / 160) return;
    const finds = ["wheatSeed", "stone", "copperOre", "magicCrystal"];
    const found = finds[rand(0, finds.length - 1)];
    addItem(found, 1);
    game.pet.foundToday = true;
    say(`${game.pet.type} found ${label(found)}.`);
}

function cookSelectedRecipe() {
    const recipeName = hasItem("pumpkin", 2) ? "pumpkinPie" : "omelette";
    const recipe = recipes[recipeName];
    if (!canAfford(recipe)) {
        say("Missing cooking ingredients.");
        return;
    }
    payCost(recipe);
    addItem(recipeName, 1);
    gainXp("cooking", 12);
    say(`${label(recipeName)} cooked.`);
}

function buySelectedSeed() {
    const crop = crops[game.selectedCrop];
    if (game.gold < crop.buy) {
        say("Not enough gold.");
        return;
    }
    game.gold -= crop.buy;
    addItem(crop.seed, 1);
    say(`${crop.name} seed bought.`);
}

function shipGoods() {
    let total = 0;
    Object.keys(game.inventory).forEach((id) => {
        const value = game.market[id] || crops[id]?.sell || itemValues[id] || fishValue(id);
        if (value && game.inventory[id] > 0) {
            total += value * game.inventory[id];
            game.inventory[id] = 0;
        }
    });
    game.gold += total;
    game.stats.moneyEarned += total;
    checkAchievements();
    say(total ? `Shipped goods for ${total}g.` : "Nothing to ship.");
}

function openStorageChest() {
    const stored = Object.entries(game.inventory)
        .filter(([, qty]) => qty > 0)
        .slice(0, 8)
        .map(([id, qty]) => `${label(id)} x${qty}`)
        .join(", ");
    say(stored ? `Storage check: ${stored}` : "Storage chest is empty.");
}

function buyTool() {
    const toolsForSale = [
        ["ironSword", 350],
        ["minerBoots", 420],
        ["harvestRing", 650]
    ];
    const next = toolsForSale.find(([id]) => !hasItem(id, 1));
    if (!next) {
        say("You already own every shop tool.");
        return;
    }
    const [id, price] = next;
    if (game.gold < price) {
        say(`${label(id)} costs ${price}g.`);
        return;
    }
    game.gold -= price;
    addItem(id, 1);
    say(`${label(id)} bought.`);
}

function upgradeCurrentTool() {
    const order = ["Basic", "Copper", "Iron", "Gold"];
    const costs = {
        Copper: { gold: 250, copperOre: 5 },
        Iron: { gold: 600, ironOre: 5 },
        Gold: { gold: 1200, goldOre: 3 }
    };
    const current = game.toolTier[player.tool] || "Basic";
    const next = order[order.indexOf(current) + 1];

    if (!next) {
        say(`${toolLabels[player.tool]} is already max tier.`);
        return;
    }

    const cost = costs[next];
    if (!canAfford(cost)) {
        say(`${next} upgrade needs ${formatCost(cost)}.`);
        return;
    }

    payCost(cost);
    game.toolTier[player.tool] = next;
    say(`${toolLabels[player.tool]} upgraded to ${next}.`);
}

function repairTools() {
    const price = 25;
    if (game.gold < price) {
        say(`Tool repair costs ${price}g.`);
        return;
    }
    game.gold -= price;
    game.toolCondition ??= {};
    tools.forEach((tool) => { game.toolCondition[tool] = 100; });
    say("Tools repaired.");
}

function formatCost(cost) {
    return Object.entries(cost).map(([id, qty]) => id === "gold" ? `${qty}g` : `${qty} ${label(id)}`).join(", ");
}

function donateToMuseum() {
    const item = Object.keys(game.inventory).find((id) => game.inventory[id] > 0 && !game.collections.museum.includes(id));
    if (!item) {
        say("No new item to donate.");
        return;
    }
    removeItem(item, 1);
    game.collections.museum.push(item);
    if (game.collections.museum.length === 10) game.gold += 1000;
    say(`Donated ${label(item)} to the museum.`);
}

function openTalentMenu() {
    document.getElementById("dialogueTitle").textContent = "Talent Trees";
    document.getElementById("dialogueText").innerHTML = `Skill Points: ${game.skillPoints}`;
    const actions = document.getElementById("dialogueActions");
    actions.innerHTML = "";
    Object.entries(talentCatalog).forEach(([id, talent]) => {
        const button = document.createElement("button");
        button.textContent = game.talents[id] ? `${talent.name} learned` : `${talent.tree}: ${talent.name} (${talent.cost})`;
        button.disabled = Boolean(game.talents[id]) || game.skillPoints < talent.cost;
        button.onclick = () => {
            game.skillPoints -= talent.cost;
            game.talents[id] = true;
            say(`${talent.name} learned.`);
            renderPanels();
            openTalentMenu();
        };
        actions.appendChild(button);
    });
    addCloseButton(actions);
    document.getElementById("dialogue").classList.add("visible");
}

function openBuildMenu() {
    document.getElementById("dialogueTitle").textContent = "Building Placement";
    document.getElementById("dialogueText").textContent = "Pick a building, then face a clear tile and press E. Green preview means valid.";
    const actions = document.getElementById("dialogueActions");
    actions.innerHTML = "";
    Object.entries(buildables).forEach(([id, build]) => {
        const button = document.createElement("button");
        button.textContent = `${build.name} (${formatCost(build.cost)})`;
        button.disabled = !canAfford(build.cost);
        button.onclick = () => {
            game.placementMode = id;
            closeDialogue();
            say(`${build.name} placement mode.`);
        };
        actions.appendChild(button);
    });
    addCloseButton(actions);
    document.getElementById("dialogue").classList.add("visible");
}

function openDashboard() {
    const npcHearts = getMap().npcs.reduce((total, npc) => total + (npc.friendship || 0), 0);
    document.getElementById("dialogueTitle").textContent = "Statistics";
    document.getElementById("dialogueText").innerHTML = `
        <div class="settings-grid">
            <div>Hours Played: ${game.stats.hoursPlayed.toFixed(2)}</div>
            <div>Gold Earned: ${game.stats.moneyEarned || 0}g</div>
            <div>Fish Caught: ${game.stats.fishCaught}</div>
            <div>Crops Harvested: ${game.stats.cropsHarvested}</div>
            <div>Trees Chopped: ${game.stats.treesChopped}</div>
            <div>Animals Raised: ${game.animals.length}</div>
            <div>NPC Hearts: ${npcHearts}</div>
            <div>Museum Items: ${game.collections.museum.length}</div>
        </div>
    `;
    const actions = document.getElementById("dialogueActions");
    actions.innerHTML = "";
    addCloseButton(actions);
    document.getElementById("dialogue").classList.add("visible");
}

function openAchievements() {
    checkAchievements();
    const unlocked = Object.values(game.achievements || {}).filter(Boolean).length;
    const total = Object.keys(achievements).length;
    const lines = Object.entries(achievements).map(([id, achievement]) => (
        `<div class="item">${game.achievements?.[id] ? "Unlocked" : "Locked"} - ${achievement.name}<br><span class="hint">${getAchievementProgress(id)}</span></div>`
    )).join("<br>");
    document.getElementById("dialogueTitle").textContent = `Achievements ${unlocked}/${total}`;
    document.getElementById("dialogueText").innerHTML = lines;
    const actions = document.getElementById("dialogueActions");
    actions.innerHTML = "";
    addCloseButton(actions);
    document.getElementById("dialogue").classList.add("visible");
}

function openQuestJournal() {
    const planted = getMap().id === "farm" && getMap().tiles.some((row) => row.some((tile) => tile.crop));
    const lines = [
        { name: "Learn the farm", done: game.tutorial?.moved && game.tutorial?.interacted, reward: "Basic controls" },
        { name: "Plant a crop", done: planted, reward: "Growth tracking" },
        { name: "First harvest", done: game.stats.cropsHarvested > 0, reward: "Progression loop" },
        { name: "Meet the village", done: (game.maps.farm?.npcs || []).some((npc) => npc.friendship > 0), reward: "Friendship" }
    ];

    document.getElementById("dialogueTitle").textContent = "Quest Journal";
    document.getElementById("dialogueText").innerHTML = lines.map((quest) => (
        `<div class="item">${quest.done ? "Complete" : "Active"} - ${quest.name}<br><span class="hint">Reward: ${quest.reward}</span></div>`
    )).join("<br>");
    const actions = document.getElementById("dialogueActions");
    actions.innerHTML = "";
    addCloseButton(actions);
    document.getElementById("dialogue").classList.add("visible");
}

function getAchievementProgress(id) {
    const progress = {
        firstHarvest: `${Math.min(game.stats.cropsHarvested, 1)}/1 harvest`,
        masterFarmer: `${Math.min(game.stats.cropsHarvested, 100)}/100 harvests`,
        millionaire: `${Math.min(game.gold, 1000000)}/1000000g`,
        fishingExpert: `${Math.min(game.stats.fishCaught, 50)}/50 fish`,
        treeDestroyer: `${Math.min(game.stats.treesChopped, 50)}/50 trees`,
        caveChampion: `${Math.min(game.stats.bossesDefeated, 1)}/1 boss`,
        museumPatron: `${Math.min(game.collections.museum.length, 10)}/10 donations`
    };
    return progress[id] || "Portfolio milestone";
}

function openCredits() {
    document.getElementById("dialogueTitle").textContent = "Credits";
    document.getElementById("dialogueText").innerHTML = `
        <div class="settings-grid">
            <div><strong>Developer:</strong> Sharan</div>
            <div><strong>Built With:</strong> HTML5 Canvas, JavaScript, CSS</div>
            <div><strong>Version:</strong> ${GAME_VERSION}</div>
        </div>
    `;
    const actions = document.getElementById("dialogueActions");
    actions.innerHTML = "";
    addCloseButton(actions);
    document.getElementById("dialogue").classList.add("visible");
}

function openAbout() {
    document.getElementById("dialogueTitle").textContent = "About Mystic Farm";
    document.getElementById("dialogueText").innerHTML = `
        <div class="settings-grid">
            <div><strong>Features:</strong> Farming, seasons, weather, animals, NPCs, inventory, shop, skills, fishing, mining, buildings.</div>
            <div><strong>Architecture:</strong> Core managers, gameplay systems, entities, and UI modules.</div>
            <div><strong>Tech Stack:</strong> Vanilla JavaScript, HTML5 Canvas, CSS, LocalStorage, PWA cache.</div>
            <div><strong>Portfolio Focus:</strong> Game loop, state management, rendering, collision, save recovery, accessibility, and product polish.</div>
        </div>
    `;
    const actions = document.getElementById("dialogueActions");
    actions.innerHTML = "";
    addCloseButton(actions);
    document.getElementById("dialogue").classList.add("visible");
}

function openSettings() {
    document.getElementById("dialogueTitle").textContent = "Settings";
    document.getElementById("dialogueText").innerHTML = `
        <div class="settings-grid">
            <label>Music Volume <input id="musicSetting" type="range" min="0" max="100" value="${settings.musicVolume}"></label>
            <label>SFX Volume <input id="sfxSetting" type="range" min="0" max="100" value="${settings.sfxVolume}"></label>
            <label>Interact Key <input id="interactSetting" value="${settings.interactKey}" maxlength="1"></label>
            <label>UI Scale
                <select id="uiScaleSetting">
                    <option value="normal" ${settings.uiScale === "normal" ? "selected" : ""}>Normal</option>
                    <option value="large" ${settings.uiScale === "large" ? "selected" : ""}>Large</option>
                </select>
            </label>
            <label><input id="fullscreenSetting" type="checkbox" ${settings.fullscreen ? "checked" : ""}> Fullscreen</label>
            <label><input id="colorSetting" type="checkbox" ${settings.colorBlind ? "checked" : ""}> Color Blind Mode</label>
        </div>
    `;
    const actions = document.getElementById("dialogueActions");
    actions.innerHTML = "";
    const save = document.createElement("button");
    save.textContent = "Save Settings";
    save.onclick = saveSettingsFromMenu;
    actions.appendChild(save);
    addCloseButton(actions);
    document.getElementById("dialogue").classList.add("visible");
}

function saveSettingsFromMenu() {
    settings.musicVolume = Number(document.getElementById("musicSetting").value);
    settings.sfxVolume = Number(document.getElementById("sfxSetting").value);
    settings.interactKey = (document.getElementById("interactSetting").value || "e").toLowerCase()[0];
    settings.colorBlind = document.getElementById("colorSetting").checked;
    settings.fullscreen = document.getElementById("fullscreenSetting").checked;
    settings.uiScale = document.getElementById("uiScaleSetting").value;
    localStorage.setItem("mysticFarmSettings", JSON.stringify(settings));
    applySettings();
    refreshMusicVolume();
    say("Settings saved.");
}

function loadSettings() {
    try {
        return { ...defaultSettings, ...JSON.parse(localStorage.getItem("mysticFarmSettings") || "{}") };
    } catch (error) {
        return { ...defaultSettings };
    }
}

function applySettings() {
    document.body.classList.toggle("color-blind", settings.colorBlind);
    document.body.classList.toggle("large-ui", settings.uiScale === "large");
    if (settings.fullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
    }
    if (!settings.fullscreen && document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
    }
}

function checkAchievements() {
    game.achievements ||= {};
    Object.entries(achievements).forEach(([id, achievement]) => {
        if (!game.achievements[id] && achievement.test()) {
            game.achievements[id] = true;
            notify(`Achievement: ${achievement.name}`);
            playSfx("quest");
        }
    });
}

function toggleCoopDemo() {
    if (!("BroadcastChannel" in window)) {
        say("BroadcastChannel not supported in this browser.");
        return;
    }
    game.multiplayer.enabled = !game.multiplayer.enabled;
    game.multiplayer.role = game.multiplayer.enabled ? "host-tab" : "solo";
    setupCoopChannel();
    say(game.multiplayer.enabled ? "Co-op demo enabled. Open another tab." : "Co-op demo disabled.");
}

function addCloseButton(actions) {
    const close = document.createElement("button");
    close.textContent = "Close";
    close.onclick = closeDialogue;
    actions.appendChild(close);
}

function saveGame(slot = 1, silent = false) {
    const ok = saveManager.save(slot, { game, player });
    if (!silent) say(ok ? `Saved slot ${slot}.` : "Save failed. Backup kept.");
}

function loadGame(slot = 1) {
    try {
        const data = saveManager.load(slot);
        if (!data) {
            say(`Slot ${slot} is empty.`);
            return;
        }
        Object.assign(game, data.game || data);
        if (data.player) {
            Object.assign(player, data.player);
        }
    } catch (error) {
        try {
            const backup = saveManager.loadBackup(slot);
            if (!backup) throw error;
            Object.assign(game, backup.game || backup);
            if (backup.player) Object.assign(player, backup.player);
            say(`Recovered slot ${slot} from backup.`);
        } catch (backupError) {
            say(`Slot ${slot} could not be loaded.`);
            return;
        }
    }
    migrateFarmLayout();
    ensurePlayerOnWalkableTile();
    setupCoopChannel();
    renderPanels();
    renderToolButtons();
    renderSeedSelect();
    say(`Loaded slot ${slot}.`);
}

function migrateFarmLayout() {
    ensureLocationMaps();
    const farm = game.maps?.farm;
    if (!farm) return;

    clearOldPondStrip(farm);
    createFarmLayout(farm);
    placeRect(farm, 14, 5, 2, 2, "shop", true);
    placeRect(farm, 20, 5, 2, 2, "museum", true);
    placeRect(farm, 26, 5, 2, 2, "mine", true);
    createVillageArea(farm);
    if (game.maps.house) configureHouseInterior(game.maps.house);
    if (game.maps.shop) configureStoreInterior(game.maps.shop);
    if (game.maps.blacksmith) configureBlacksmithInterior(game.maps.blacksmith);
    if (game.maps.barn) configureBarnInterior(game.maps.barn);
    farm.exits = farm.exits || [];
    upsertExit(farm, { x: 7, y: 7, to: "house", spawn: [7, 9] });
    upsertExit(farm, { x: 14, y: 7, to: "shop", spawn: [7, 9] });
    upsertExit(farm, { x: 37, y: 14, to: "blacksmith", spawn: [7, 9] });
    upsertExit(farm, { x: 10, y: 16, to: "barn", spawn: [8, 9] });
    upsertExit(farm, { x: 20, y: 7, to: "museum", spawn: [8, 9] });
    upsertExit(farm, { x: 26, y: 7, to: "mine", spawn: [3, 3] });
    setInteriorExit("house", { x: 7, y: 10, to: "farm", spawn: [7, 8] });
    setInteriorExit("shop", { x: 7, y: 10, to: "farm", spawn: [14, 8] });
    setInteriorExit("blacksmith", { x: 7, y: 10, to: "farm", spawn: [37, 15] });
    setInteriorExit("barn", { x: 8, y: 10, to: "farm", spawn: [10, 17] });
    setInteriorExit("mine", { x: 3, y: 3, to: "farm", spawn: [26, 8] });
    setInteriorExit("museum", { x: 8, y: 10, to: "farm", spawn: [20, 8] });

    const ben = farm.npcs?.find((npc) => npc.id === "ben");
    if (ben) {
        ben.x = 8;
        ben.y = 23;
        ben.schedule = { Morning: [8, 23], Afternoon: [18, 10], Evening: [8, 23] };
    }

    updateVillageNpcSchedules(farm);
}

function ensureLocationMaps() {
    game.maps ??= {};
    game.maps.farm ??= buildMap("farm", "Farm", MAP_W, MAP_H);
    game.maps.house ??= buildMap("house", "Farmhouse", 16, 12, "floor");
    game.maps.shop ??= buildMap("shop", "General Store", 16, 12, "floor");
    game.maps.blacksmith ??= buildMap("blacksmith", "Blacksmith", 16, 12, "floor");
    game.maps.barn ??= buildMap("barn", "Barn Interior", 18, 12, "floor");
    game.maps.mine ??= buildMap("mine", "Mine 1", 34, 24, "stoneFloor");
    game.maps.museum ??= buildMap("museum", "Museum", 18, 12, "floor");
}

function upsertExit(map, exit) {
    map.exits ??= [];
    const existing = map.exits.find((item) => item.to === exit.to);
    if (existing) {
        Object.assign(existing, exit);
    } else {
        map.exits.push(exit);
    }
}

function setInteriorExit(mapId, exit) {
    if (!game.maps[mapId]) return;
    game.maps[mapId].exits = [exit];
}

function updateVillageNpcSchedules(farm) {
    const schedules = {
        emma: { Morning: [30, 8], Afternoon: [34, 14], Evening: [14, 7], Night: [30, 8] },
        noah: { Morning: [35, 8], Afternoon: [34, 14], Evening: [36, 14], Night: [35, 8] },
        ava: { Morning: [38, 10], Afternoon: [34, 14], Evening: [14, 7], Night: [38, 10] },
        iris: { Morning: [40, 8], Afternoon: [34, 14], Evening: [14, 7], Night: [40, 8] },
        liam: { Morning: [28, 12], Afternoon: [34, 14], Evening: [14, 7], Night: [28, 12] }
    };

    farm.npcs?.forEach((npc) => {
        if (schedules[npc.id]) npc.schedule = schedules[npc.id];
    });
}

function clearOldPondStrip(farm) {
    for (let y = 22; y <= 23; y++) {
        for (let x = 8; x < 18; x++) {
            if (farm.tiles[y]?.[x]?.type === "water") {
                farm.tiles[y][x] = { type: "grass", solid: false, crop: null, watered: false, resource: null, hp: 0 };
            }
        }
    }
}

function addItem(id, qty) {
    game.inventory[id] = (game.inventory[id] || 0) + qty;
    renderPanels();
}

function removeItem(id, qty) {
    game.inventory[id] = Math.max(0, (game.inventory[id] || 0) - qty);
    renderPanels();
}

function hasItem(id, qty) {
    return (game.inventory[id] || 0) >= qty;
}

function canAfford(cost) {
    return Object.entries(cost).every(([id, qty]) => id === "gold" ? game.gold >= qty : hasItem(id, qty));
}

function payCost(cost) {
    Object.entries(cost).forEach(([id, qty]) => {
        if (id === "gold") game.gold -= qty;
        else removeItem(id, qty);
    });
}

function fishValue(id) {
    if (["sardine", "carp", "bass", "tuna", "catfish", "icefish", "lingcod"].includes(id)) return 70;
    if (id === "pufferfish") return 150;
    if (["goldenKoi", "moonCarp", "ancientTuna", "crystalSalmon"].includes(id)) return 1000;
    return 0;
}

function spendEnergy(qty) {
    player.energy = Math.max(0, player.energy - qty);
}

function gainXp(skill, xp) {
    const data = game.skills[skill];
    data.xp += xp;
    if (data.xp >= data.level * 50 && data.level < 10) {
        data.xp = 0;
        data.level++;
        game.skillPoints++;
        say(`${label(skill)} level ${data.level}.`);
    }
}

function label(id) {
    if (crops[id]) return crops[id].name;
    if (id.endsWith("Seed")) return `${label(id.replace("Seed", ""))} Seed`;
    return id.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function say(text) {
    message = text;
    messageTimer = 3000;
    notify(text);
}

function notify(text) {
    const stack = document.getElementById("toastStack");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = text;
    stack.appendChild(toast);
    toast.addEventListener("animationend", () => toast.remove());
}

function playSfx(type) {
    audioManager.setVolumes({ musicVolume: settings.musicVolume / 100, sfxVolume: settings.sfxVolume / 100 });
    audioManager.playSfx(type);
}

function startSeasonMusic() {
    audioManager.setVolumes({ musicVolume: settings.musicVolume / 100, sfxVolume: settings.sfxVolume / 100 });
    audioManager.startSeasonMusic(game.season);
}

function refreshMusicVolume() {
    audioManager.setVolumes({ musicVolume: settings.musicVolume / 100, sfxVolume: settings.sfxVolume / 100 });
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function createSystems() {
    systems.player = { update: updatePlayer };
    systems.farm = { layout: createFarmLayout, plant: plantCrop, nextDay };
    systems.animal = { update: updateAnimals };
    systems.weather = { update: updateAmbientParticles };
    systems.render = { updateCamera, render, drawMap };
    systems.ui = { renderHud, renderPanels };
}

function formatGameTime() {
    const t = Math.floor(game.time || 360);
    const h = Math.floor(t / 100) % 24;
    const m = Math.floor((t % 100) * 0.6);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function renderHud() {
    const seasonIcon = { Spring: "🌸", Summer: "☀️", Fall: "🍂", Winter: "❄️" }[game.season] || "🌱";
    const weatherIcon = { Sunny: "☀", Rainy: "🌧", Windy: "💨" }[game.weather] || "☀";
    document.getElementById("day").textContent = `Day ${game.day}`;
    document.getElementById("season").textContent = game.season;
    document.getElementById("seasonIcon").textContent = seasonIcon;
    document.getElementById("weather").textContent = game.weather;
    document.getElementById("weatherIcon").textContent = weatherIcon;
    document.getElementById("timeHud").textContent = formatGameTime();
    document.getElementById("gold").textContent = game.gold;
    document.getElementById("energy").textContent = player.energy;
    document.getElementById("health").textContent = player.health;
    const debugElement = document.getElementById("debug");
    debugElement.classList.toggle("visible", debugConsole.visible);
    debugElement.innerHTML = debugConsole.visible
        ? `Tile ${Math.floor(player.x / TILE)}, ${Math.floor(player.y / TILE)}<br>Pixel ${Math.round(player.x)}, ${Math.round(player.y)}<br>FPS ${fps}<br>Tool ${toolLabels[player.tool]}<br>Collision ${collidesAt(player.x, player.y) ? "blocked" : "clear"}<br>Camera ${Math.round(camera.x)}, ${Math.round(camera.y)}`
        : "";
    debugConsole.render();
}

function renderPanels() {
    const inv = document.getElementById("inventory");
    inv.innerHTML = "";
    Object.entries(game.inventory)
        .filter(([, qty]) => qty > 0)
        .sort()
        .forEach(([id, qty]) => {
            const item = document.createElement("div");
            item.className = "item";
            item.textContent = `${label(id)} x${qty}`;
            inv.appendChild(item);
        });

    document.getElementById("systems").innerHTML = `
        Fishing Lv ${game.skills.fishing.level}, Mining Lv ${game.skills.mining.level}<br>
        Farming Lv ${game.skills.farming.level}, Cooking Lv ${game.skills.cooking.level}<br>
        Skill Points: ${game.skillPoints}<br>
        Weapon: ${equipment[player.equipment.weapon]?.name || "None"}<br>
        Market Wheat: ${game.market.wheat || crops.wheat.sell}g, Pumpkin: ${game.market.pumpkin || crops.pumpkin.sell}g<br>
        Festival: ${game.activeFestival?.name || "None"}<br>
        Pet: ${game.pet.type} ${game.pet.happiness}<br>
        Fish Collection: ${game.collections.fish.length}<br>
        Museum: ${game.collections.museum.length}<br>
        Animals: ${game.animals.map((a) => `${a.type} ${a.happiness}`).join(", ")}<br>
        Stats: ${game.stats.cropsHarvested} harvests, ${game.stats.fishCaught} fish, ${game.stats.enemiesDefeated} enemies
    `;
}

function renderToolButtons() {
    const toolsEl = document.getElementById("tools");
    toolsEl.innerHTML = "";
    tools.forEach((tool) => {
        const button = document.createElement("button");
        button.textContent = `${tools.indexOf(tool) + 1}. ${toolLabels[tool]}`;
        button.className = player.tool === tool ? "selected" : "";
        button.onclick = () => {
            player.tool = tool;
            renderToolButtons();
        };
        toolsEl.appendChild(button);
    });
}

function renderSeedSelect() {
    const select = document.getElementById("seedSelect");
    select.innerHTML = "";
    Object.entries(crops).forEach(([id, crop]) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = crop.name;
        select.appendChild(option);
    });
    select.value = game.selectedCrop;
}

function gameLoop(now) {
    const dt = now - lastTime;
    lastTime = now;
    fps = Math.round(1000 / Math.max(dt, 1));
    update(dt);
    render();
    requestAnimationFrame(gameLoop);
}

function bindInput() {
    window.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();
        if (event.key === "Escape" && uiState.screen !== "title") {
            event.preventDefault();
            togglePause();
            return;
        }
        keys[key] = true;
        startSeasonMusic();
        if (event.key === "F3") {
            event.preventDefault();
            debugConsole.toggle();
        }
        if (event.key === "F12") {
            event.preventDefault();
            toggleScreenshotMode();
            return;
        }
        if (event.key === "F10") {
            event.preventDefault();
            toggleCinematicMode();
            return;
        }
        if (key === "m" && !event.repeat) {
            uiState.minimapVisible = !uiState.minimapVisible;
            say(uiState.minimapVisible ? "Minimap on." : "Minimap off.");
            return;
        }
        if (key === "j" && !event.repeat) {
            event.preventDefault();
            openQuestJournal();
            return;
        }
        if (tools[Number(event.key) - 1]) {
            player.tool = tools[Number(event.key) - 1];
            renderToolButtons();
        }
        if ((key === settings.interactKey || event.code === "Space") && !event.repeat && !player.fishing) {
            event.preventDefault();
            if (uiState.screen === "title" || uiState.paused) return;
            interact();
        }
    });
    window.addEventListener("keyup", (event) => {
        const key = event.key.toLowerCase();
        if (event.code === "Space" && player.fishing) finishFishing();
        keys[key] = false;
    });
    document.getElementById("seedSelect").addEventListener("change", (event) => {
        game.selectedCrop = event.target.value;
    });
    document.getElementById("sleepBtn").onclick = nextDay;
    document.getElementById("shopBtn").onclick = buySelectedSeed;
    document.getElementById("shipBtn").onclick = shipGoods;
    document.getElementById("cookBtn").onclick = cookSelectedRecipe;
    document.getElementById("talentBtn").onclick = openTalentMenu;
    document.getElementById("buildBtn").onclick = openBuildMenu;
    document.getElementById("dashBtn").onclick = openDashboard;
    document.getElementById("achieveBtn").onclick = openAchievements;
    document.getElementById("settingsBtn").onclick = openSettings;
    document.getElementById("coopBtn").onclick = toggleCoopDemo;
    document.querySelectorAll("[data-save]").forEach((button) => {
        button.onclick = () => saveGame(button.dataset.save);
    });
    document.querySelectorAll("[data-load]").forEach((button) => {
        button.onclick = () => loadGame(button.dataset.load);
    });
    document.querySelectorAll("[data-touch]").forEach((button) => {
        const key = button.dataset.touch;
        button.addEventListener("touchstart", (event) => { event.preventDefault(); keys[key] = true; });
        button.addEventListener("touchend", (event) => { event.preventDefault(); keys[key] = false; });
        button.addEventListener("mousedown", () => { keys[key] = true; });
        button.addEventListener("mouseup", () => { keys[key] = false; });
    });
    document.querySelector("[data-action='interact']").onclick = interact;
    document.addEventListener("click", (event) => {
        if (event.target.closest("button")) playSfx("button");
    });
    document.getElementById("playBtn").onclick = startGameFromTitle;
    document.getElementById("titleLoadBtn").onclick = () => {
        loadGame(1);
        startGameFromTitle();
    };
    document.getElementById("titleSettingsBtn").onclick = openSettings;
    document.getElementById("titleCreditsBtn").onclick = openCredits;
    document.getElementById("titleAboutBtn").onclick = openAbout;
    document.getElementById("resumeBtn").onclick = togglePause;
    document.getElementById("pauseSettingsBtn").onclick = openSettings;
    document.getElementById("pauseSaveBtn").onclick = () => saveGame(1);
    document.getElementById("pauseTitleBtn").onclick = returnToTitle;
    updateMenuScreens();
}

function toggleScreenshotMode() {
    uiState.screenshotMode = !uiState.screenshotMode;
    document.body.classList.toggle("screenshot-mode", uiState.screenshotMode);
    say(uiState.screenshotMode ? "Screenshot mode on." : "Screenshot mode off.");
}

function toggleCinematicMode() {
    uiState.cinematicMode = !uiState.cinematicMode;
    document.body.classList.toggle("cinematic-mode", uiState.cinematicMode);
    say(uiState.cinematicMode ? "Cinematic mode on." : "Cinematic mode off.");
}

function startGameFromTitle() {
    uiState.screen = "game";
    uiState.paused = false;
    uiState.fade = 1;
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    updateMenuScreens();
    startSeasonMusic();
}

function togglePause() {
    uiState.paused = !uiState.paused;
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    updateMenuScreens();
}

function returnToTitle() {
    uiState.screen = "title";
    uiState.paused = false;
    Object.keys(keys).forEach((key) => { keys[key] = false; });
    updateMenuScreens();
}

function updateMenuScreens() {
    document.getElementById("titleScreen").classList.toggle("visible", uiState.screen === "title");
    document.getElementById("pauseScreen").classList.toggle("visible", uiState.paused);
}

async function loadMods() {
    try {
        const response = await fetch("mods/crops.json", { cache: "no-store" });
        if (!response.ok) return;
        const modCrops = await response.json();
        Object.entries(modCrops).forEach(([id, crop]) => {
            crops[id] = {
                name: crop.name || label(id),
                seed: crop.seed || `${id}Seed`,
                buy: crop.buy || 50,
                sell: crop.sell || 100,
                days: crop.growDays || crop.days || 4,
                season: crop.season || ["Spring"],
                color: crop.color || "#d7b34a"
            };
        });
        renderSeedSelect();
        say("Loaded crop mods.");
    } catch (error) {
        // Mods are optional for the portfolio build.
    }
}

function registerPwa() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js").catch(() => {});
    }
}

function completeLoading() {
    updateLoadingProgress();
    window.setTimeout(() => {
        document.getElementById("loadingScreen").classList.add("hidden");
    }, 650);
}

function updateLoadingProgress() {
    const loaded = sprites.loaded + externalAssetsLoaded;
    const total = sprites.total + EXTERNAL_ASSET_TOTAL;
    const percent = Math.round((loaded / total) * 100);
    const fill = document.getElementById("loadingFill");
    const text = document.getElementById("loadingText");

    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `${loaded} / ${total} assets`;
}

createSystems();
initializeMaps();
ensurePlayerOnWalkableTile();
applySettings();
bindInput();
renderSeedSelect();
renderToolButtons();
rollMarket();
renderPanels();
loadMods();
registerPwa();
completeLoading();
requestAnimationFrame(gameLoop);

