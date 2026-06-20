# Save Format

Save slots are stored in `localStorage`.

```text
mysticFarmSlot1
mysticFarmSlot2
mysticFarmSlot3
```

Before writing a slot, the old value is copied to:

```text
mysticFarmSlot1Backup
mysticFarmSlot2Backup
mysticFarmSlot3Backup
```

## Shape

```json
{
  "game": {
    "day": 1,
    "season": "Spring",
    "year": 1,
    "gold": 500,
    "inventory": {},
    "stats": {},
    "maps": {}
  },
  "player": {
    "x": 336,
    "y": 336,
    "energy": 100,
    "health": 100,
    "equipment": {}
  }
}
```

If the primary save is corrupted, `SaveManager` attempts to load the backup.
