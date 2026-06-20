export class MapManager {
    constructor({ game, player, tileSize, ensureWalkable, centerCamera, onTransition, describeMap }) {
        this.game = game;
        this.player = player;
        this.tileSize = tileSize;
        this.ensureWalkable = ensureWalkable;
        this.centerCamera = centerCamera;
        this.onTransition = onTransition;
        this.describeMap = describeMap;
        this.previousMap = "farm";
    }

    enterMap(mapId, spawn) {
        this.transitionToMap(mapId, spawn);
    }

    exitMap(mapId = "farm", spawn = [7, 8]) {
        this.transitionToMap(mapId, spawn);
    }

    transitionToMap(mapId, spawn) {
        if (!this.game.maps?.[mapId]) return false;
        this.previousMap = this.game.currentMap;
        this.game.currentMap = mapId;
        this.player.x = spawn[0] * this.tileSize;
        this.player.y = spawn[1] * this.tileSize;
        this.ensureWalkable();
        this.centerCamera();
        this.onTransition?.();
        return true;
    }
}
