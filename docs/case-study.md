# Portfolio Case Study

## Problem

Build a browser-based farming RPG that demonstrates more than static UI: real-time rendering, state management, procedural content, and long-term progression.

## Design

The game uses HTML5 Canvas, a game loop, map data, tile objects, and modular systems for farming, mining, fishing, crafting, NPCs, economy, and persistence.

## Challenge

Managing many tile states while keeping rendering fast and save data stable.

## Solution

The map is data-driven. Tiles store type, crop, water, resource, and collision state. The renderer only draws visible tiles, while `SaveManager` protects save data with backups.

## Results

- 100% vanilla JavaScript
- HTML5 Canvas renderer
- ES module architecture
- Automated unit tests
- PWA-ready offline build
- Save backups and corruption handling
